import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createBot = mutation({
  args: {
    name: v.string(),
    systemPrompt: v.string(),
    apiKey: v.optional(v.string()),
    config: v.object({
      model: v.string(),
      temperature: v.number(),
      provider: v.optional(v.union(v.literal("openai"), v.literal("groq"))),
      primaryColor: v.optional(v.string()),
      welcomeMessage: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    const clerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.plan === "free") {
      const existingBots = await ctx.db
        .query("bots")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .collect();

      if (existingBots.length >= 1) {
        throw new Error("Free plan users can only have 1 bot. Please upgrade.");
      }
    }

    const botId = await ctx.db.insert("bots", {
      clerkId,
      name: args.name,
      systemPrompt: args.systemPrompt,
      apiKey: args.apiKey,
      config: args.config,
    });

    return botId;
  },
});

export const getBots = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const clerkId = identity.subject;
    const bots = await ctx.db
      .query("bots")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .collect();

    return bots;
  },
});

export const getBot = query({
  args: { id: v.id("bots") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const bot = await ctx.db.get(args.id);
    if (!bot) throw new Error("Bot not found");

    if (bot.clerkId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return bot;
  },
});

export const updateBot = mutation({
  args: {
    id: v.id("bots"),
    name: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    apiKey: v.optional(v.string()),
    config: v.optional(
      v.object({
        model: v.string(),
        temperature: v.number(),
        provider: v.optional(v.union(v.literal("openai"), v.literal("groq"))),
        primaryColor: v.optional(v.string()),
        welcomeMessage: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const bot = await ctx.db.get(args.id);
    if (!bot) throw new Error("Bot not found");

    if (bot.clerkId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteBot = mutation({
  args: { id: v.id("bots") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const bot = await ctx.db.get(args.id);
    if (!bot) throw new Error("Bot not found");

    if (bot.clerkId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
