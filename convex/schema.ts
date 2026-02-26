import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.optional(v.number()), 
  }).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    isGroup: v.boolean(),
    name: v.optional(v.string()),
  }),

  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    isTyping: v.optional(v.boolean()),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_userId", ["userId"]),

  // Inside convex/schema.ts
messages: defineTable({
  conversationId: v.id("conversations"),
  senderId: v.id("users"),
  content: v.string(),
  isDeleted: v.optional(v.boolean()),
  isRead: v.optional(v.boolean()),
  // Feature 12: Reactions
  reactions: v.optional(
    v.array(
      v.object({
        emoji: v.string(),
        userIds: v.array(v.id("users")),
      })
    )
  ),
}).index("by_conversationId", ["conversationId"]),
});