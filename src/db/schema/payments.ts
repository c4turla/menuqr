import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { restaurants } from "./restaurants";

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  orderId: text("order_id").notNull().unique(),
  paymentId: text("payment_id"), // UUID from SumoPod
  amount: integer("amount").notNull(),
  fee: integer("fee").default(0),
  netAmount: integer("net_amount").default(0),
  plan: text("plan").notNull(), // "basic" | "pro"
  billingPeriod: text("billing_period").notNull(), // "monthly" | "yearly"
  status: text("status").notNull().default("pending"), // pending | completed | failed | expired
  paymentMethod: text("payment_method"), // e.g. "qris"
  paymentLinkUrl: text("payment_link_url"),
  expiresAt: timestamp("expires_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
