import { pgClient } from "./index";

async function checkConnection() {
  console.log("🔍 Checking PostgreSQL database connectivity...");
  try {
    const result = await pgClient`SELECT 1 + 1 AS result, version() AS version`;
    console.log("✅ Database connection successful!");
    console.log("   PostgreSQL Version:", result[0].version);
  } catch (error) {
    console.warn("⚠️ Could not connect to PostgreSQL database.");
    console.warn("   Details:", (error as Error).message);
  } finally {
    await pgClient.end();
  }
}

checkConnection();
