import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Collection queries
export async function getUserCollections(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { collections } = await import("../drizzle/schema");
  return db.select().from(collections).where(eq(collections.userId, userId));
}

export async function getCollectionById(collectionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { collections } = await import("../drizzle/schema");
  const result = await db.select().from(collections).where(eq(collections.id, collectionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCollection(data: { userId: number; name: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { collections } = await import("../drizzle/schema");
  const result = await db.insert(collections).values(data);
  return result;
}

export async function updateCollection(collectionId: number, data: { name?: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { collections } = await import("../drizzle/schema");
  await db.update(collections).set(data).where(eq(collections.id, collectionId));
}

export async function deleteCollection(collectionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { collections } = await import("../drizzle/schema");
  await db.delete(collections).where(eq(collections.id, collectionId));
}

// Card queries
export async function getCardsByCollection(collectionId: number) {
  const db = await getDb();
  if (!db) return [];
  const { cards } = await import("../drizzle/schema");
  return db.select().from(cards).where(eq(cards.collectionId, collectionId));
}

export async function getCardById(cardId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { cards } = await import("../drizzle/schema");
  const result = await db.select().from(cards).where(eq(cards.id, cardId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCard(data: {
  collectionId: number;
  playerName: string;
  brandId?: number | null;
  seriesId?: number | null;
  subseriesId?: number | null;
  specialtyId?: number | null;
  season: string;
  cardNumber: string;
  isAutograph?: number;
  isNumbered?: number;
  numberedCurrent?: number | null;
  numberedOf?: number | null;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { cards } = await import("../drizzle/schema");
  const result = await db.insert(cards).values(data);
  return result;
}

export async function updateCard(
  cardId: number,
  data: {
    playerName?: string;
    brandId?: number | null;
    seriesId?: number | null;
    subseriesId?: number | null;
    specialtyId?: number | null;
    season?: string;
    cardNumber?: string;
    isAutograph?: number;
    isNumbered?: number;
    numberedCurrent?: number | null;
    numberedOf?: number | null;
    notes?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { cards } = await import("../drizzle/schema");
  await db.update(cards).set(data).where(eq(cards.id, cardId));
}

export async function deleteCard(cardId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { cards } = await import("../drizzle/schema");
  await db.delete(cards).where(eq(cards.id, cardId));
}

// Reference data queries
export async function getAllBrands() {
  const db = await getDb();
  if (!db) return [];
  const { brands } = await import("../drizzle/schema");
  return db.select().from(brands);
}

export async function getAllSeries() {
  const db = await getDb();
  if (!db) return [];
  const { series } = await import("../drizzle/schema");
  return db.select().from(series);
}

export async function getAllSpecialties() {
  const db = await getDb();
  if (!db) return [];
  const { specialties } = await import("../drizzle/schema");
  return db.select().from(specialties);
}

export async function createBrand(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { brands } = await import("../drizzle/schema");
  return db.insert(brands).values({ name });
}

export async function updateBrand(id: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { brands } = await import("../drizzle/schema");
  await db.update(brands).set({ name }).where(eq(brands.id, id));
}

export async function deleteBrand(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { brands } = await import("../drizzle/schema");
  await db.delete(brands).where(eq(brands.id, id));
}

export async function createSeries(name: string, brandId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { series } = await import("../drizzle/schema");
  return db.insert(series).values({ name, brandId });
}

export async function updateSeries(id: number, name: string, brandId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { series } = await import("../drizzle/schema");
  await db.update(series).set({ name, brandId }).where(eq(series.id, id));
}

export async function deleteSeries(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { series } = await import("../drizzle/schema");
  await db.delete(series).where(eq(series.id, id));
}

export async function createSpecialty(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { specialties } = await import("../drizzle/schema");
  return db.insert(specialties).values({ name });
}

export async function updateSpecialty(id: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { specialties } = await import("../drizzle/schema");
  await db.update(specialties).set({ name }).where(eq(specialties.id, id));
}

export async function deleteSpecialty(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { specialties } = await import("../drizzle/schema");
  await db.delete(specialties).where(eq(specialties.id, id));
}

export async function getAllSubseries() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { subseries } = await import("../drizzle/schema");
  return db.select().from(subseries);
}

export async function createSubseries(name: string, seriesId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { subseries } = await import("../drizzle/schema");
  return db.insert(subseries).values({ name, seriesId });
}

export async function updateSubseries(id: number, name: string, seriesId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { subseries } = await import("../drizzle/schema");
  await db.update(subseries).set({ name, seriesId }).where(eq(subseries.id, id));
}

export async function deleteSubseries(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { subseries } = await import("../drizzle/schema");
  await db.delete(subseries).where(eq(subseries.id, id));
}
