import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOrGet = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    // Check if a 1-on-1 conversation already exists
    const existing = await ctx.db
      .query("conversationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .collect();

    for (const member of existing) {
      const otherMember = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversationId", (q) => q.eq("conversationId", member.conversationId))
        .filter((q) => q.eq(q.field("userId"), args.otherUserId))
        .unique();

      if (otherMember) return member.conversationId;
    }

    // Create new conversation if none found
    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: currentUser._id,
    });
    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: args.otherUserId,
    });

    return conversationId;
  },
});

export const setTypingIndicator = mutation({
  args: { conversationId: v.id("conversations"), isTyping: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return;

    const member = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    if (member) {
      await ctx.db.patch(member._id, { isTyping: args.isTyping });
    }
  },
});

export const getTypingStatus = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return null;

    // Find the other member in this conversation who is currently typing
    const typingMember = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => 
        q.and(
          q.neq(q.field("userId"), currentUser._id), // Not me
          q.eq(q.field("isTyping"), true)            // Is typing
        )
      )
      .first();

    if (!typingMember) return null;

    // Fetch their name to display "Name is typing..."
    const user = await ctx.db.get(typingMember.userId);
    return user?.name;
  },
});

// Add to convex/conversations.ts
export const getConversationIdWithUser = query({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return null;

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .collect();

    for (const m of membership) {
      const other = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversationId", (q) => q.eq("conversationId", m.conversationId))
        .filter((q) => q.eq(q.field("userId"), args.otherUserId))
        .unique();
      if (other) return m.conversationId;
    }
    return null;
  },
});
export const getById = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    // 1. Fetch all members for this conversation
    const members = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    // 2. Identify the "other user" for 1-on-1 chats
    let otherUser = null;
    if (!conversation.isGroup) {
      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();

      const otherMember = members.find((m) => m.userId !== currentUser?._id);
      if (otherMember) {
        otherUser = await ctx.db.get(otherMember.userId);
      }
    }

    // 3. Return the combined data including memberCount
    return {
      ...conversation,
      otherUser: otherUser ? {
        name: otherUser.name,
        imageUrl: otherUser.imageUrl,
        isOnline: otherUser.isOnline,
      } : null,
      memberCount: members.length, // This fixes the TypeScript error
    };
  },
});

export const createGroup = mutation({
  args: { 
    userIds: v.array(v.id("users")), 
    groupName: v.string() 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // 1. Create the conversation record as a group
    const conversationId = await ctx.db.insert("conversations", {
      isGroup: true,
      name: args.groupName,
    });

    // 2. Add all selected members to the group
    for (const userId of args.userIds) {
      await ctx.db.insert("conversationMembers", {
        conversationId,
        userId,
      });
    }

    return conversationId;
  },
});