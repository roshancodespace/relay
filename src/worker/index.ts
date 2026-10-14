import http from "node:http";
import { Worker } from "bullmq";
import { QUEUE_NAME, redisConnection } from "@/queue/client";
import { processDelivery } from "./processor";
import { recoverPendingDeliveries } from "./recovery";
import { pgClient } from "@/db";
import { log } from "./logger";

const CONCURRENCY = 10;

log.banner(QUEUE_NAME, CONCURRENCY);

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { deliveryId } = job.data;
    await processDelivery(deliveryId);
  },
  {
    connection: redisConnection,
    concurrency: CONCURRENCY,
  }
);

worker.on("ready", () => {
  log.ready(QUEUE_NAME, CONCURRENCY);
});

worker.on("failed", (job, err) => {
  log.error(`Job ${job?.id} failed`, err);
});

worker.on("error", (err) => {
  log.warn(`Redis connection warning: ${err.message}`);
});

// Run recovery sweeper immediately and every 60 seconds
recoverPendingDeliveries().catch(() => { });
const recoveryInterval = setInterval(() => {
  recoverPendingDeliveries().catch(() => { });
}, 60 * 1000);

// HTTP health check
let httpServer: http.Server | null = null;
const healthPort =
  process.env.WORKER_PORT ||
  (process.env.RENDER || process.env.NODE_ENV === "production" ? process.env.PORT : null);

if (healthPort) {
  const port = parseInt(healthPort, 10);
  httpServer = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy", service: "relay-worker", queue: QUEUE_NAME }));
  });
  httpServer.on("error", (err: any) => {
    log.warn(`Health check server warning: ${err.message}`);
  });
  httpServer.listen(port, () => {
    log.info(`Health check endpoint active on port ${port}`);
  });
}

// Shutdown
let isShuttingDown = false;
async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  log.shutdown(signal);
  clearInterval(recoveryInterval);
  if (httpServer) {
    httpServer.close();
  }

  try {
    await worker.close();
    if (["ready", "connecting"].includes(redisConnection.status)) {
      await redisConnection.quit().catch(() => { });
    }
    await pgClient.end().catch(() => { });
    log.info("Worker stopped cleanly");
    process.exit(0);
  } catch (err) {
    log.error("Error during worker shutdown", err);
    process.exit(1);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
