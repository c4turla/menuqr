import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";
import { restaurants } from "./restaurants";
import { categories } from "./categories";

export interface ModifierOption {
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelection: number;
  maxSelection: number;
  options: ModifierOption[];
}

export const menuItems = pgTable("menu_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 0 }).notNull(),
  imageUrl: text("image_url"),
  available: boolean("available").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  modifiers: jsonb("modifiers").$type<ModifierGroup[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

