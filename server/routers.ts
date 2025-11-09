import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  collections: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserCollections } = await import("./db");
      return getUserCollections(ctx.user.id);
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { createCollection } = await import("./db");
        return createCollection({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1, "Name is required").optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { getCollectionById, updateCollection } = await import("./db");
        const collection = await getCollectionById(input.id);
        if (!collection || collection.userId !== ctx.user.id) {
          throw new Error("Collection not found or unauthorized");
        }
        await updateCollection(input.id, {
          name: input.name,
          description: input.description,
        });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getCollectionById, deleteCollection } = await import("./db");
        const collection = await getCollectionById(input.id);
        if (!collection || collection.userId !== ctx.user.id) {
          throw new Error("Collection not found or unauthorized");
        }
        await deleteCollection(input.id);
        return { success: true };
      }),
  }),

  cards: router({
    listByCollection: protectedProcedure
      .input(z.object({ collectionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getCollectionById, getCardsByCollection } = await import("./db");
        const collection = await getCollectionById(input.collectionId);
        if (!collection || collection.userId !== ctx.user.id) {
          throw new Error("Collection not found or unauthorized");
        }
        return getCardsByCollection(input.collectionId);
      }),
    create: protectedProcedure
      .input(
        z.object({
          collectionId: z.number(),
          playerName: z.string().min(1, "Player name is required"),
          brandId: z.number().nullable().optional(),
          seriesId: z.number().nullable().optional(),
          specialtyId: z.number().nullable().optional(),
          season: z.string().min(1, "Season is required"),
          cardNumber: z.string().min(1, "Card number is required"),
          isAutograph: z.boolean().optional(),
          isNumbered: z.boolean().optional(),
          numberedCurrent: z.number().nullable().optional(),
          numberedOf: z.number().nullable().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { getCollectionById, createCard } = await import("./db");
        const collection = await getCollectionById(input.collectionId);
        if (!collection || collection.userId !== ctx.user.id) {
          throw new Error("Collection not found or unauthorized");
        }
        return createCard({
          ...input,
          isAutograph: input.isAutograph ? 1 : 0,
          isNumbered: input.isNumbered ? 1 : 0,
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          playerName: z.string().min(1).optional(),
          brandId: z.number().nullable().optional(),
          seriesId: z.number().nullable().optional(),
          specialtyId: z.number().nullable().optional(),
          season: z.string().min(1).optional(),
          cardNumber: z.string().min(1).optional(),
          isAutograph: z.boolean().optional(),
          isNumbered: z.boolean().optional(),
          numberedCurrent: z.number().nullable().optional(),
          numberedOf: z.number().nullable().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { getCardById, getCollectionById, updateCard } = await import("./db");
        const card = await getCardById(input.id);
        if (!card) {
          throw new Error("Card not found");
        }
        const collection = await getCollectionById(card.collectionId);
        if (!collection || collection.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        const { id, ...updateData } = input;
        const processedData: any = { ...updateData };
        if (updateData.isAutograph !== undefined) {
          processedData.isAutograph = updateData.isAutograph ? 1 : 0;
        }
        if (updateData.isNumbered !== undefined) {
          processedData.isNumbered = updateData.isNumbered ? 1 : 0;
        }
        await updateCard(id, processedData);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getCardById, getCollectionById, deleteCard } = await import("./db");
        const card = await getCardById(input.id);
        if (!card) {
          throw new Error("Card not found");
        }
        const collection = await getCollectionById(card.collectionId);
        if (!collection || collection.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        await deleteCard(input.id);
        return { success: true };
      }),
  }),

  // Reference data - accessible to all authenticated users
  brands: router({
    list: protectedProcedure.query(async () => {
      const { getAllBrands } = await import("./db");
      return getAllBrands();
    }),
    create: adminProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const { createBrand } = await import("./db");
        return createBrand(input.name);
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), name: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const { updateBrand } = await import("./db");
        await updateBrand(input.id, input.name);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteBrand } = await import("./db");
        await deleteBrand(input.id);
        return { success: true };
      }),
  }),

  series: router({
    list: protectedProcedure.query(async () => {
      const { getAllSeries } = await import("./db");
      return getAllSeries();
    }),
    create: adminProcedure
      .input(z.object({ name: z.string().min(1), brandId: z.number().nullable() }))
      .mutation(async ({ input }) => {
        const { createSeries } = await import("./db");
        return createSeries(input.name, input.brandId);
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), name: z.string().min(1), brandId: z.number().nullable() }))
      .mutation(async ({ input }) => {
        const { updateSeries } = await import("./db");
        await updateSeries(input.id, input.name, input.brandId);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteSeries } = await import("./db");
        await deleteSeries(input.id);
        return { success: true };
      }),
  }),

  specialties: router({
    list: protectedProcedure.query(async () => {
      const { getAllSpecialties } = await import("./db");
      return getAllSpecialties();
    }),
    create: adminProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const { createSpecialty } = await import("./db");
        return createSpecialty(input.name);
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), name: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const { updateSpecialty } = await import("./db");
        await updateSpecialty(input.id, input.name);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteSpecialty } = await import("./db");
        await deleteSpecialty(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
