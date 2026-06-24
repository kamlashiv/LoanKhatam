import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// Restrict cross-origin access to the app's own domains. The frontend talks to
// this API same-origin (via the Replit path proxy), so the only browser origins
// we need to trust are this deployment's own domains (from REPLIT_DOMAINS).
// Reflecting an arbitrary origin together with credentials would let any website
// read a signed-in user's private financial data, so we use an exact-match
// allowlist — never a wildcard suffix like *.replit.dev, which any attacker
// could satisfy with their own Repl.
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = new Set(
  (process.env.REPLIT_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => `https://${d}`),
);

function isOriginAllowed(origin: string): boolean {
  if (allowedOrigins.has(origin)) return true;
  // Allow localhost (any port) only outside production, for local dev tooling.
  if (!isProduction) {
    try {
      const host = new URL(origin).hostname;
      if (host === "localhost" || host === "127.0.0.1") return true;
    } catch {
      return false;
    }
  }
  return false;
}

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      // Same-origin requests, curl, and server-to-server calls send no Origin.
      // Disallowed origins resolve to `false`: cors omits the
      // Access-Control-Allow-Origin header, so the browser blocks the
      // cross-origin read without surfacing a noisy 500.
      if (!origin || isOriginAllowed(origin)) return callback(null, true);
      return callback(null, false);
    },
  }),
);

// Baseline security headers. These responses are JSON API payloads (never
// framed), so we can set strict framing/sniffing protections safely.
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
  next();
});

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.use(
  clerkMiddleware((req) => {
    const host = getClerkProxyHost(req) ?? "";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    let publishableKey = process.env.CLERK_PUBLISHABLE_KEY;
    if (!isLocal) {
      try {
        publishableKey = publishableKeyFromHost(host, process.env.CLERK_PUBLISHABLE_KEY) || publishableKey;
      } catch (e) {
        logger.warn({ err: e }, "Failed to parse Clerk key from host in backend");
      }
    }
    return { publishableKey };
  }),
);

app.use("/api", router);

export default app;
