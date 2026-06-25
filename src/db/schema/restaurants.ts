import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const planEnum = pgEnum("plan", ["free", "basic", "pro"]);

export const restaurants = pgTable("restaurants", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  phone: text("phone"),
  whatsappNumber: text("whatsapp_number"),
  address: text("address"),
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  plan: planEnum("plan").notNull().default("free"),
  customDomain: text("custom_domain"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
