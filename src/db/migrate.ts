import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, pgClient } from "./index";

async function runMigrations() {
  console.log("⏳ Running database migrations...");
  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("✅ Migrations applied successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

runMigrations();
