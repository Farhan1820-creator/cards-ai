// db/schema.ts
import {
  pgTable,
  text,
  timestamp,
  varchar,
  jsonb,
  boolean,
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
  message: text("message"),

  
  imageUrl: text("image_url").notNull(),

  categoryId: text("category_id").notNull().references(()=>categories.id),

  cloudinaryPublicId: text("cloudinary_public_id").notNull(),

  overlayConfig: jsonb("overlay_config"), 

  isActive: boolean("is_active").default(true).notNull(),

  createdBy: text("created_by").references(() => users.id),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: text("slug").notNull().unique(), 
});


export const cards = pgTable("cards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  templateId: text("template_id"),
  categoryId: text("category_id").references(() => categories.id),
  imageUrl: text("image_url").notNull(),
  prompt: text("prompt"),
  recipientName: varchar("recipient_name", { length: 255 }),
  message: varchar("message"),
  nameColor: varchar("name_color", { length: 20 }),
  messageColor: varchar("message_color", { length: 20 }),
  photoUrl: text("photo_url"),
  photoTransform: jsonb("photo_transform"),
  createdAt: timestamp("created_at").defaultNow(),
});


