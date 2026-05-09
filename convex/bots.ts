import { action, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

type Provider = "openai" | "groq" | "openrouter" | "anthropic" | "gemini";

function getApiEndpoint(provider: Provider): string {
  if (provider === "groq") return "https://api.groq.com/openai/v1/chat/completions";
  if (provider === "openrouter") return "https://openrouter.ai/api/v1/chat/completions";
  if (provider === "anthropic") return "https://api.anthropic.com/v1/messages";
  // Gemini uses a model-specific URL
  return "https://api.openai.com/v1/chat/completions";
}

export const createBot = mutation({
  args: {
    name: v.string(),
    systemPrompt: v.string(),
    apiKey: v.optional(v.string()),
    config: v.object({
      model: v.string(),
      temperature: v.number(),
      provider: v.optional(
        v.union(
          v.literal("openai"),
          v.literal("groq"),
          v.literal("openrouter"),
          v.literal("anthropic"),
          v.literal("gemini")
        )
      ),
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
      enabled: true,
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

export const getBotPublic = query({
  args: { id: v.id("bots") },
  handler: async (ctx, args) => {
    const bot = await ctx.db.get(args.id);
    if (!bot) return null;

    const enabled = bot.enabled ?? true;
    return {
      _id: bot._id,
      name: bot.name,
      enabled,
      config: {
        provider: (bot.config.provider ?? "openai") as Provider,
        model: bot.config.model,
        primaryColor: bot.config.primaryColor ?? "#6c63ff",
        welcomeMessage: bot.config.welcomeMessage ?? "Hi! 👋 I'm your AI assistant. How can I help you today?",
      },
    };
  },
});

export const getBotForChatInternal = internalQuery({
  args: { id: v.id("bots") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const chatWithBotPublic = action({
  args: {
    id: v.id("bots"),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const bot = await ctx.runQuery(internal.bots.getBotForChatInternal, { id: args.id });

    if (!bot) throw new Error("Bot not found");
    if ((bot.enabled ?? true) === false) {
      throw new Error("Bot is offline");
    }

    const provider: Provider = (bot.config.provider ?? "openai") as Provider;
    const model = bot.config.model;

    const envOpenAI = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "";
    const envGroq = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "";
    const envOpenRouter = process.env.OPENROUTER_API_KEY || "";
    const envAnthropic = process.env.ANTHROPIC_API_KEY || "";
    const envGemini = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

    const apiKey = (
      bot.apiKey ||
      (provider === "groq"
        ? envGroq
        : provider === "openrouter"
          ? envOpenRouter
          : provider === "anthropic"
            ? envAnthropic
            : provider === "gemini"
              ? envGemini
              : envOpenAI) ||
      ""
    ).trim();

    if (!apiKey) {
      throw new Error(
        `Missing API key for ${provider}. Set a per-bot key in the Admin UI or configure the provider env key in Convex (OPENAI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY).`
      );
    }

    const history = args.messages.slice(-12);
    let res: Response;

    if (provider === "anthropic") {
      const anthropicMessages = history.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: [{ type: "text", text: m.content }],
      }));

      res = await fetch(getApiEndpoint(provider), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 400,
          system: bot.systemPrompt,
          messages: anthropicMessages,
        }),
      });
    } else if (provider === "gemini") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const contents = history.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: bot.systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 400 },
        }),
      });
    } else {
      // OpenAI-compatible: openai, groq, openrouter
      const body = {
        model,
        messages: [{ role: "system", content: bot.systemPrompt }, ...history],
        max_tokens: 400,
        temperature: 0.7,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };

      if (provider === "openrouter") {
        // Optional metadata for OpenRouter; safe to omit if unset
        if (process.env.OPENROUTER_SITE_URL) headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
        if (process.env.OPENROUTER_APP_NAME) headers["X-Title"] = process.env.OPENROUTER_APP_NAME;
      }

      res = await fetch(getApiEndpoint(provider), {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    }

    if (!res.ok) {
      let err: any = {};
      try {
        err = await res.json();
      } catch {
        // ignore
      }
      const msg =
        err?.error?.message ||
        err?.message ||
        err?.error ||
        (typeof err === "string" ? err : "") ||
        `API error ${res.status}`;
      throw new Error(msg);
    }

    const data: any = await res.json();

    if (provider === "anthropic") {
      const parts = Array.isArray(data?.content) ? data.content : [];
      const text = parts.find((p: any) => p?.type === "text")?.text;
      return { content: text || "Sorry, I could not generate a response." };
    }

    if (provider === "gemini") {
      const text =
        data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join("") ||
        data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return { content: text || "Sorry, I could not generate a response." };
    }

    const content = data?.choices?.[0]?.message?.content || "Sorry, I could not generate a response.";
    return { content };
  },
});

export const updateBot = mutation({
  args: {
    id: v.id("bots"),
    name: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    apiKey: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    config: v.optional(
      v.object({
        model: v.string(),
        temperature: v.number(),
        provider: v.optional(
          v.union(
            v.literal("openai"),
            v.literal("groq"),
            v.literal("openrouter"),
            v.literal("anthropic"),
            v.literal("gemini")
          )
        ),
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
