import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Stores or updates the user information upon login.
 */
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user !== null) {
      await ctx.db.patch(user._id, {
        name: identity.name ?? "Anonymous",
        imageUrl: identity.pictureUrl ?? "",
        // We set them to online when they successfully "store"/log in
        isOnline: true,
        lastSeen: Date.now(),
      });
      return user._id;
    }

    return await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      email: identity.email ?? "no-email",
      imageUrl: identity.pictureUrl ?? "",
      clerkId: identity.subject,
      isOnline: true,
      lastSeen: Date.now(),
    });
  },
});

/**
 * Updates the user's online status and timestamp.
 */
export const updateStatus = mutation({
  args: { isOnline: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        isOnline: args.isOnline,
        lastSeen: Date.now(),
      });
    }
  },
});

/**
 * Gets the current authenticated user's data.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

/**
 * Gets all users (used for the sidebar list).
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});