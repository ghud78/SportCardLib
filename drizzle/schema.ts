import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, double } from "drizzle-orm/mysql-core";

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
  categoryId: int("categoryId"),
  collectionTypeId: int("collectionTypeId"),
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
  teamId: int("teamId"), // Team dropdown
  brandId: int("brandId"),
  seriesId: int("seriesId"),
  insertId: int("insertId"), // Renamed from subseriesId
  parallelId: int("parallelId"), // Renamed from specialtyId
  memorabilia: text("memorabilia"), // Simple text field
  season: varchar("season", { length: 50 }).notNull(), // e.g., "1998-99" or "2014-15"
  cardNumber: varchar("cardNumber", { length: 100 }).notNull(), // e.g., "214" or "ST-XYZ"
  isAutograph: int("isAutograph").default(0).notNull(), // 0 = false, 1 = true
  autographTypeId: int("autographTypeId"), // Type of Autograph dropdown
  isNumbered: int("isNumbered").default(0).notNull(), // 0 = false, 1 = true
  numberedOf: int("numberedOf"), // Maximum number (e.g., 99 in "25/99")
  numberedCurrent: int("numberedCurrent"), // Current number (e.g., 25 in "25/99")
  isGraded: int("isGraded").default(0).notNull(), // 0 = false, 1 = true
  gradeCompanyId: int("gradeCompanyId"), // Grade Company dropdown
  gradeSerialNumber: varchar("gradeSerialNumber", { length: 40 }), // Grading cert number
  imageFrontUrl: text("imageFrontUrl"), // URL to front image of the card
  imageBackUrl: text("imageBackUrl"), // URL to back image of the card
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Card = typeof cards.$inferSelect;
export type InsertCard = typeof cards.$inferInsert;

/**
 * Card Grades table - stores multiple grade entries per card
 * A card can have multiple grades (e.g., BGS has Centering, Corners, Surface, Edges, Overall)
 */
export const cardGrades = mysqlTable("cardGrades", {
  id: int("id").autoincrement().primaryKey(),
  cardId: int("cardId").notNull().references(() => cards.id, { onDelete: "cascade" }),
  gradeType: mysqlEnum("gradeType", ["Centering", "Corners", "Surface", "Edges", "Overall", "Autograph"]).notNull(),
  gradeQuality: varchar("gradeQuality", { length: 20 }).notNull(), // Can be numeric (9.5) or text (Authentic)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CardGrade = typeof cardGrades.$inferSelect;
export type InsertCardGrade = typeof cardGrades.$inferInsert;

/**
 * Teams table - admin-managed list of teams
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Autograph Types table - admin-managed list of autograph types
 */
export const autographTypes = mysqlTable("autographTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutographType = typeof autographTypes.$inferSelect;
export type InsertAutographType = typeof autographTypes.$inferInsert;

/**
 * Grade Companies table - admin-managed list of grading companies
 */
export const gradeCompanies = mysqlTable("gradeCompanies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GradeCompany = typeof gradeCompanies.$inferSelect;
export type InsertGradeCompany = typeof gradeCompanies.$inferInsert;

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
 * Inserts table - admin-managed list of card inserts (renamed from subseries)
 */
export const inserts = mysqlTable("inserts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  seriesId: int("seriesId").references(() => series.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Insert = typeof inserts.$inferSelect;
export type InsertInsert = typeof inserts.$inferInsert;

/**
 * Parallels table - admin-managed list of card parallels (renamed from specialties)
 */
export const parallels = mysqlTable("parallels", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Parallel = typeof parallels.$inferSelect;
export type InsertParallel = typeof parallels.$inferInsert;

/**
 * Categories table - admin-managed list of collection categories (Basketball, Baseball, F1, etc.)
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Collection Types table - admin-managed list of collection types (Player, Series, Parallels, etc.)
 */
export const collectionTypes = mysqlTable("collectionTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CollectionType = typeof collectionTypes.$inferSelect;
export type InsertCollectionType = typeof collectionTypes.$inferInsert;
