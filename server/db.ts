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
  brand: string;
  season: string;
  cardNumber: string;
  series: string;
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
    brand?: string;
    season?: string;
    cardNumber?: string;
    series?: string;
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

// Get unique values for dropdowns
export async function getUniqueBrands(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { cards, collections } = await import("../drizzle/schema");
  const result = await db
    .selectDistinct({ brand: cards.brand })
    .from(cards)
    .innerJoin(collections, eq(cards.collectionId, collections.id))
    .where(eq(collections.userId, userId));
  return result.map(r => r.brand);
}

export async function getUniqueSeries(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { cards, collections } = await import("../drizzle/schema");
  const result = await db
    .selectDistinct({ series: cards.series })
    .from(cards)
    .innerJoin(collections, eq(cards.collectionId, collections.id))
    .where(eq(collections.userId, userId));
  return result.map(r => r.series);
}
