import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

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
          brand: z.string().min(1, "Brand is required"),
          season: z.string().min(1, "Season is required"),
          cardNumber: z.string().min(1, "Card number is required"),
          series: z.string().min(1, "Series is required"),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { getCollectionById, createCard } = await import("./db");
        const collection = await getCollectionById(input.collectionId);
        if (!collection || collection.userId !== ctx.user.id) {
          throw new Error("Collection not found or unauthorized");
        }
        return createCard(input);
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          playerName: z.string().min(1).optional(),
          brand: z.string().min(1).optional(),
          season: z.string().min(1).optional(),
          cardNumber: z.string().min(1).optional(),
          series: z.string().min(1).optional(),
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
        await updateCard(id, updateData);
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
    getUniqueBrands: protectedProcedure.query(async ({ ctx }) => {
      const { getUniqueBrands } = await import("./db");
      return getUniqueBrands(ctx.user.id);
    }),
    getUniqueSeries: protectedProcedure.query(async ({ ctx }) => {
      const { getUniqueSeries } = await import("./db");
      return getUniqueSeries(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
