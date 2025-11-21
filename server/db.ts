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

export async function createCollection(data: { userId: number; name: string; description?: string; categoryId?: number; collectionTypeId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { collections } = await import("../drizzle/schema");
  const result = await db.insert(collections).values(data);
  return result;
}

export async function updateCollection(collectionId: number, data: { name?: string; description?: string; categoryId?: number; collectionTypeId?: number }) {
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
  teamId?: number;
  brandId?: number;
  seriesId?: number;
  insertId?: number;
  parallelId?: number;
  memorabilia?: string;
  season: string;
  cardNumber: string;
  isAutograph?: number;
  autographTypeId?: number;
  isNumbered?: number;
  numberedOf?: number;
  numberedCurrent?: number;
  imageFrontUrl?: string;
  imageBackUrl?: string;
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
    teamId?: number;
    brandId?: number;
    seriesId?: number;
    insertId?: number;
    parallelId?: number;
    memorabilia?: string;
    season?: string;
    cardNumber?: string;
    isAutograph?: number;
    autographTypeId?: number;
    isNumbered?: number;
    numberedOf?: number;
    numberedCurrent?: number;
    imageFrontUrl?: string;
    imageBackUrl?: string;
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

export async function getAllParallels() {
  const db = await getDb();
  if (!db) return [];
  const { parallels } = await import("../drizzle/schema");
  return db.select().from(parallels);
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
  const { parallels } = await import("../drizzle/schema");
  return db.insert(parallels).values({ name });
}

export async function updateSpecialty(id: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { parallels } = await import("../drizzle/schema");
  await db.update(parallels).set({ name }).where(eq(parallels.id, id));
}

export async function deleteSpecialty(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { parallels } = await import("../drizzle/schema");
  await db.delete(parallels).where(eq(parallels.id, id));
}

// Category helpers
export async function getAllCategories() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { categories } = await import("../drizzle/schema");
  return db.select().from(categories);
}

export async function createCategory(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { categories } = await import("../drizzle/schema");
  return db.insert(categories).values({ name });
}

export async function updateCategory(id: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { categories } = await import("../drizzle/schema");
  await db.update(categories).set({ name }).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { categories } = await import("../drizzle/schema");
  await db.delete(categories).where(eq(categories.id, id));
}

// Collection Type helpers
export async function getAllCollectionTypes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { collectionTypes } = await import("../drizzle/schema");
  return db.select().from(collectionTypes);
}

export async function createCollectionType(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { collectionTypes } = await import("../drizzle/schema");
  return db.insert(collectionTypes).values({ name });
}

export async function updateCollectionType(id: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { collectionTypes } = await import("../drizzle/schema");
  await db.update(collectionTypes).set({ name }).where(eq(collectionTypes.id, id));
}

export async function deleteCollectionType(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { collectionTypes } = await import("../drizzle/schema");
  await db.delete(collectionTypes).where(eq(collectionTypes.id, id));
}

export async function getAllInsert() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { inserts } = await import("../drizzle/schema");
  return db.select().from(inserts);
}

export async function createInsert(name: string, seriesId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { inserts } = await import("../drizzle/schema");
  return db.insert(inserts).values({ name, seriesId });
}

export async function updateInsert(id: number, name: string, seriesId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { inserts } = await import("../drizzle/schema");
  await db.update(inserts).set({ name, seriesId }).where(eq(inserts.id, id));
}

export async function deleteInsert(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { inserts } = await import("../drizzle/schema");
  await db.delete(inserts).where(eq(inserts.id, id));
}

// Teams
export async function getAllTeams() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { teams } = await import("../drizzle/schema");
  return db.select().from(teams);
}

export async function createTeam(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { teams } = await import("../drizzle/schema");
  return db.insert(teams).values({ name });
}

export async function updateTeam(id: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { teams } = await import("../drizzle/schema");
  await db.update(teams).set({ name }).where(eq(teams.id, id));
}

export async function deleteTeam(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { teams } = await import("../drizzle/schema");
  await db.delete(teams).where(eq(teams.id, id));
}

// Autograph Types
export async function getAllAutographTypes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { autographTypes } = await import("../drizzle/schema");
  return db.select().from(autographTypes);
}

export async function createAutographType(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { autographTypes } = await import("../drizzle/schema");
  return db.insert(autographTypes).values({ name });
}

export async function updateAutographType(id: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { autographTypes } = await import("../drizzle/schema");
  await db.update(autographTypes).set({ name }).where(eq(autographTypes.id, id));
}

export async function deleteAutographType(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { autographTypes } = await import("../drizzle/schema");
  await db.delete(autographTypes).where(eq(autographTypes.id, id));
}

// Grade Companies
export async function getAllGradeCompanies() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { gradeCompanies } = await import("../drizzle/schema");
  return db.select().from(gradeCompanies);
}

export async function createGradeCompany(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { gradeCompanies } = await import("../drizzle/schema");
  return db.insert(gradeCompanies).values({ name });
}

export async function updateGradeCompany(id: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { gradeCompanies } = await import("../drizzle/schema");
  await db.update(gradeCompanies).set({ name }).where(eq(gradeCompanies.id, id));
}

export async function deleteGradeCompany(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { gradeCompanies } = await import("../drizzle/schema");
  await db.delete(gradeCompanies).where(eq(gradeCompanies.id, id));
}

// Card Grades
export async function getCardGrades(cardId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { cardGrades } = await import("../drizzle/schema");
  return db.select().from(cardGrades).where(eq(cardGrades.cardId, cardId));
}

export async function createCardGrade(cardId: number, gradeType: string, gradeQuality: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { cardGrades } = await import("../drizzle/schema");
  return db.insert(cardGrades).values({ cardId, gradeType: gradeType as any, gradeQuality });
}

export async function updateCardGrade(id: number, gradeType: string, gradeQuality: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { cardGrades } = await import("../drizzle/schema");
  await db.update(cardGrades).set({ gradeType: gradeType as any, gradeQuality }).where(eq(cardGrades.id, id));
}

export async function deleteCardGrade(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { cardGrades } = await import("../drizzle/schema");
  await db.delete(cardGrades).where(eq(cardGrades.id, id));
}
