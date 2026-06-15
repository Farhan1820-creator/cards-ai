// db/schema.ts
import {
  pgTable,
  text,
  timestamp,
  varchar,
  jsonb,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  password: text("password"),
  image: text("image"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  otp: varchar("otp", { length: 6 }),
  otpExpires: timestamp("otp_expires"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  overlayConfig: jsonb("overlay_config"),   // photo zone position/size etc.
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdBy: text("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cards = pgTable("cards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  templateId: text("template_id"),
  imageUrl: text("image_url").notNull(),
  prompt: text("prompt").notNull(),
  cardType: varchar("card_type", { length: 50 }).notNull(),
  recipientName: varchar("recipient_name", { length: 255 }),
  nameColor: varchar("name_color", { length: 20 }),
  messageColor: varchar("message_color", { length: 20 }),
  photoUrl: text("photo_url"),
  photoTransform: jsonb("photo_transform"),
  createdAt: timestamp("created_at").defaultNow(),
});

