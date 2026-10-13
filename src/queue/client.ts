import { Queue } from "bullmq";
import Redis from "ioredis";
import { env } from "@/lib/env";

export const QUEUE_NAME = "webhook-deliveries";

let redisInstance: Redis | null = null;
let queueInstance: Queue<DeliveryJobData> | null = null;

export function getRedisConnection(): Redis {
  if (!redisInstance) {
    const isTls = env.REDIS_URL.startsWith("rediss://");

    redisInstance = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      connectTimeout: 10000,
      ...(isTls
        ? {
          tls: {
            rejectUnauthorized: false,
          },
        }
        : {}),
      retryStrategy(times) {
        if (process.env.NODE_ENV === "test") {
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });

    redisInstance.on("error", (err) => {
      if (process.env.NODE_ENV !== "test") {
        console.warn("⚠️ Redis connection issue:", err.message);
      }
    });
  }
  return redisInstance;
}

export interface DeliveryJobData {
  deliveryId: string;
}

export function getDeliveryQueue(): Queue<DeliveryJobData> {
  if (!queueInstance) {
    queueInstance = new Queue<DeliveryJobData>(QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: { age: 3600, count: 1000 },
        removeOnFail: { age: 86400, count: 5000 },
      },
    });
  }
  return queueInstance;
}

export const redisConnection = getRedisConnection();
