import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import app from "./app";
import { logger } from "./lib/logger";
import {
  getStats,
  getActivityFeed,
  addPresence,
  removePresence,
  connectionCount,
  MAX_CONNECTIONS_PER_VISITOR,
  onStateChange,
} from "./lib/site-stats";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = createServer(app);

// ---------------------------------------------------------------------------
// WebSocket server for real-time site stats + activity feed.
// Attached to the same HTTP server on the /api/ws path so it routes through
// the shared proxy alongside the REST API.
// ---------------------------------------------------------------------------
const wss = new WebSocketServer({ server, path: "/api/ws" });

type LiveClient = WebSocket & { isAlive?: boolean; visitorId?: string | null };

/** Pull a sanitized visitorId from the WS handshake query string, if present. */
function visitorIdFromRequest(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, "http://localhost");
    const raw = parsed.searchParams.get("visitorId");
    if (raw && raw.length >= 8 && raw.length <= 64) return raw;
  } catch {
    /* malformed URL — treat as anonymous */
  }
  return null;
}

async function buildSnapshot(): Promise<string> {
  const stats = await getStats();
  return JSON.stringify({
    type: "snapshot",
    stats,
    activity: getActivityFeed(),
  });
}

async function broadcast(): Promise<void> {
  if (wss.clients.size === 0) return;
  let payload: string;
  try {
    payload = await buildSnapshot();
  } catch (err) {
    logger.error({ err }, "Failed to build WS snapshot");
    return;
  }
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Re-broadcast whenever in-memory live state changes (presence/activity).
onStateChange(() => {
  void broadcast();
});

wss.on("connection", (socket: LiveClient, request) => {
  const visitorId = visitorIdFromRequest(request.url);

  // Cap simultaneous connections per visitor so one actor can't inflate
  // presence by opening many sockets.
  if (visitorId && connectionCount(visitorId) >= MAX_CONNECTIONS_PER_VISITOR) {
    socket.close(1013, "Too many connections");
    return;
  }

  socket.isAlive = true;
  socket.visitorId = visitorId;
  socket.on("pong", () => {
    socket.isAlive = true;
  });

  // Register presence (deduped by visitorId) and send an immediate snapshot.
  addPresence(visitorId);
  void buildSnapshot()
    .then((payload) => {
      if (socket.readyState === WebSocket.OPEN) socket.send(payload);
    })
    .catch((err) => logger.error({ err }, "Failed to send initial snapshot"));

  socket.on("close", () => {
    removePresence(socket.visitorId ?? null);
  });

  socket.on("error", (err) => {
    logger.error({ err }, "WebSocket client error");
  });
});

// Heartbeat: drop dead connections so presence stays accurate. Terminating a
// socket fires its "close" handler, which releases the visitor's presence.
const heartbeat = setInterval(() => {
  for (const client of wss.clients as Set<LiveClient>) {
    if (client.isAlive === false) {
      client.terminate();
      continue;
    }
    client.isAlive = false;
    client.ping();
  }
}, 30_000);

wss.on("close", () => clearInterval(heartbeat));

server.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
