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

// Graceful shutdown
async function shutdown(signal: string) {
  log.shutdown(signal);
  clearInterval(recoveryInterval);

  try {
    await worker.close();
    await redisConnection.quit();
    await pgClient.end();
    log.info("Worker stopped cleanly");
    process.exit(0);
  } catch (err) {
    log.error("Error during worker shutdown", err);
    process.exit(1);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
