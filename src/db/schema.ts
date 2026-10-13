import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Users Table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

// Projects Table
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_projects_user_id").on(table.userId),
  ]
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  apiKeys: many(apiKeys),
  endpoints: many(endpoints),
  events: many(events),
  deliveries: many(deliveries),
}));

// API Keys Table
export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    keyPrefix: varchar("key_prefix", { length: 16 }).notNull(), // e.g. "rel_live_a1b2"
    keyHash: varchar("key_hash", { length: 64 }).notNull().unique(), // SHA-256 hex
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_api_keys_project").on(table.projectId),
    index("idx_api_keys_lookup")
      .on(table.keyHash)
      .where(sql`${table.revokedAt} IS NULL`),
  ]
);

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  project: one(projects, {
    fields: [apiKeys.projectId],
    references: [projects.id],
  }),
}));

// Endpoints Table
export const endpoints = pgTable(
  "endpoints",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    url: text("url").notNull(),
    description: text("description"),
    eventTypes: jsonb("event_types").$type<string[]>().notNull(), // e.g. ["order.created", "user.*"] or ["*"]
    signingSecret: varchar("signing_secret", { length: 128 }).notNull(), // e.g. "whsec_..." (70 chars)
    isEnabled: boolean("is_enabled").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_endpoints_project_enabled").on(table.projectId, table.isEnabled),
  ]
);

export const endpointsRelations = relations(endpoints, ({ one, many }) => ({
  project: one(projects, {
    fields: [endpoints.projectId],
    references: [projects.id],
  }),
  deliveries: many(deliveries),
}));

// Events Table
export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 128 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_events_project_created").on(table.projectId, table.createdAt),
    uniqueIndex("idx_events_idempotency")
      .on(table.projectId, table.idempotencyKey)
      .where(sql`${table.idempotencyKey} IS NOT NULL`),
  ]
);

export const eventsRelations = relations(events, ({ one, many }) => ({
  project: one(projects, {
    fields: [events.projectId],
    references: [projects.id],
  }),
  deliveries: many(deliveries),
}));

// Deliveries Table
export type DeliveryStatus = "pending" | "retrying" | "delivered" | "failed";

export const deliveries = pgTable(
  "deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    eventId: uuid("event_id")
      .references(() => events.id, { onDelete: "cascade" })
      .notNull(),
    endpointId: uuid("endpoint_id")
      .references(() => endpoints.id, { onDelete: "cascade" })
      .notNull(),
    status: varchar("status", { length: 20 })
      .$type<DeliveryStatus>()
      .default("pending")
      .notNull(),
    attemptsCount: integer("attempts_count").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(5).notNull(),
    nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_deliveries_project_created").on(table.projectId, table.createdAt),
    index("idx_deliveries_event").on(table.eventId),
    index("idx_deliveries_endpoint").on(table.endpointId),
    index("idx_deliveries_recovery")
      .on(table.status, table.nextRetryAt)
      .where(sql`${table.status} IN ('pending', 'retrying')`),
  ]
);

export const deliveriesRelations = relations(deliveries, ({ one, many }) => ({
  project: one(projects, {
    fields: [deliveries.projectId],
    references: [projects.id],
  }),
  event: one(events, {
    fields: [deliveries.eventId],
    references: [events.id],
  }),
  endpoint: one(endpoints, {
    fields: [deliveries.endpointId],
    references: [endpoints.id],
  }),
  attempts: many(deliveryAttempts),
}));

// Delivery Attempts Table
export const deliveryAttempts = pgTable(
  "delivery_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    deliveryId: uuid("delivery_id")
      .references(() => deliveries.id, { onDelete: "cascade" })
      .notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    statusCode: integer("status_code"), // null if network failure/timeout
    responseTimeMs: integer("response_time_ms").notNull(),
    responseBody: text("response_body"), // Truncated to max 4KB
    responseHeaders: jsonb("response_headers").$type<Record<string, string>>(),
    errorMessage: text("error_message"),
    attemptedAt: timestamp("attempted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_attempts_delivery").on(table.deliveryId, table.attemptNumber),
  ]
);

export const deliveryAttemptsRelations = relations(deliveryAttempts, ({ one }) => ({
  delivery: one(deliveries, {
    fields: [deliveryAttempts.deliveryId],
    references: [deliveries.id],
  }),
}));

// Type Definitions for Application Use
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

export type Endpoint = typeof endpoints.$inferSelect;
export type NewEndpoint = typeof endpoints.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Delivery = typeof deliveries.$inferSelect;
export type NewDelivery = typeof deliveries.$inferInsert;

export type DeliveryAttempt = typeof deliveryAttempts.$inferSelect;
export type NewDeliveryAttempt = typeof deliveryAttempts.$inferInsert;
