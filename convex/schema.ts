import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    plan: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  bots: defineTable({
    clerkId: v.string(),
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
  }).index("by_clerk_id", ["clerkId"]),
});
