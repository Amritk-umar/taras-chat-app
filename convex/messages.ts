import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: { content: v.string(), conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.insert("messages", {
      content: args.content,
      conversationId: args.conversationId,
      senderId: user._id,
      isDeleted: false,
      isRead: false,
    });
  },
});

export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();
  },
});

export const remove = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    // We "soft delete" by patching a flag instead of removing the row
    await ctx.db.patch(args.messageId, { isDeleted: true });
  },
});

export const markAsRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const msg of messages) {
      await ctx.db.patch(msg._id, { isRead: true });
    }
  },
});

// Add to convex/messages.ts
export const toggleReaction = mutation({
  args: { messageId: v.id("messages"), emoji: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return;

    const message = await ctx.db.get(args.messageId);
    if (!message) return;

    let reactions = message.reactions || [];
    const reactionIndex = reactions.findIndex((r) => r.emoji === args.emoji);

    if (reactionIndex > -1) {
      const userIndex = reactions[reactionIndex].userIds.indexOf(user._id);
      if (userIndex > -1) {
        // Remove user's reaction
        reactions[reactionIndex].userIds.splice(userIndex, 1);
        // Clean up empty emoji groups
        if (reactions[reactionIndex].userIds.length === 0) {
          reactions.splice(reactionIndex, 1);
        }
      } else {
        // Add user to existing emoji group
        reactions[reactionIndex].userIds.push(user._id);
      }
    } else {
      // Create new emoji group
      reactions.push({ emoji: args.emoji, userIds: [user._id] });
    }

    await ctx.db.patch(args.messageId, { reactions });
  },
});