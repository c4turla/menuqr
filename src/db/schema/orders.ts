import { pgTable, text, timestamp, uuid, decimal, jsonb } from "drizzle-orm/pg-core";
import { restaurants } from "./restaurants";

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  tableNumber: text("table_number"),
  customerName: text("customer_name"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, cancelled
  totalPrice: decimal("total_price", { precision: 12, scale: 0 }).notNull(),
  items: jsonb("items").$type<{
    menuItemId: string;
    name: string;
    price: string;
    quantity: number;
  }[]>().notNull(),
  orderType: text("order_type").notNull().default("dine_in"), // dine_in, takeaway
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
