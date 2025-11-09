import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Collections table - stores user's card collections
 */
export const collections = mysqlTable("collections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

/**
 * Cards table - stores individual sport cards with all attributes
 */
export const cards = mysqlTable("cards", {
  id: int("id").autoincrement().primaryKey(),
  collectionId: int("collectionId").notNull(),
  playerName: varchar("playerName", { length: 255 }).notNull(),
  brandId: int("brandId"),
  seriesId: int("seriesId"),
  specialtyId: int("specialtyId"),
  season: varchar("season", { length: 50 }).notNull(), // e.g., "1998-99" or "2014-15"
  cardNumber: varchar("cardNumber", { length: 100 }).notNull(), // e.g., "214" or "ST-XYZ"
  isAutograph: int("isAutograph").default(0).notNull(), // 0 = false, 1 = true
  isNumbered: int("isNumbered").default(0).notNull(), // 0 = false, 1 = true
  numberedOf: int("numberedOf"), // Maximum number (e.g., 99 in "25/99")
  numberedCurrent: int("numberedCurrent"), // Current number (e.g., 25 in "25/99")
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Card = typeof cards.$inferSelect;
export type InsertCard = typeof cards.$inferInsert;

/**
 * Brands table - admin-managed list of card brands
 */
export const brands = mysqlTable("brands", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;

/**
 * Series table - admin-managed list of card series
 */
export const series = mysqlTable("series", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  brandId: int("brandId").references(() => brands.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Series = typeof series.$inferSelect;
export type InsertSeries = typeof series.$inferInsert;

/**
 * Specialties table - admin-managed list of card specialties
 */
export const specialties = mysqlTable("specialties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = typeof specialties.$inferInsert;