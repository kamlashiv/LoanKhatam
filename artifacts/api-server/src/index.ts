import "./env";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] || "8080";
// Support both numeric ports and named pipes or Unix sockets (like in Hostinger Passenger)
const port = /^\d+$/.test(rawPort) ? Number(rawPort) : rawPort;

const server = app.listen(port, () => {
  logger.info({ port }, "Server listening");
});

server.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});
