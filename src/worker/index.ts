import { Worker } from "bullmq";
import { QUEUE_NAME, redisConnection } from "@/queue/client";
import { processDelivery } from "./processor";
import { recoverPendingDeliveries } from "./recovery";
import { pgClient } from "@/db";

console.log("🚀 Starting Relay Webhook Delivery Worker...");

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { deliveryId } = job.data;
    await processDelivery(deliveryId);
  },
  {
    connection: redisConnection,
    concurrency: 10, // Process up to 10 deliveries concurrently per worker
  }
);

worker.on("ready", () => {
  console.log(`✅ Relay Worker is active and listening on queue '${QUEUE_NAME}'. Concurrency: 10`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed with error:`, err.message);
});

worker.on("error", (err) => {
  console.warn("⚠️ Worker queue connection warning:", err.message);
});

// Run recovery sweeper immediately and every 60 seconds
recoverPendingDeliveries().catch(() => { });
const recoveryInterval = setInterval(() => {
  recoverPendingDeliveries().catch(() => { });
}, 60 * 1000);

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Gracefully stopping Relay Worker...`);
  clearInterval(recoveryInterval);

  try {
    await worker.close();
    await redisConnection.quit();
    await pgClient.end();
    console.log("👋 Relay Worker stopped cleanly.");
    process.exit(0);
  } catch (err) {
    console.error("Error during worker shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
