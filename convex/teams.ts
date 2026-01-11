import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getCurrentUser,
  requireTeamAccess,
  requireTeamAdmin,
} from "./helpers/authorization";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const teams = await Promise.all(
      memberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId);
        return team ? { ...team, role: membership.role } : null;
      })
    );

    return teams.filter((team) => team !== null);
  },
});

export const get = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.teamId);
    return await ctx.db.get(args.teamId);
  },
});

export const getMembers = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.teamId);

    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return user
          ? {
              ...user,
              role: membership.role,
              membershipId: membership._id,
            }
          : null;
      })
    );

    return members.filter((member) => member !== null);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      ownerId: user._id,
      createdAt: Date.now(),
    });

    await ctx.db.insert("teamMembers", {
      teamId,
      userId: user._id,
      role: "admin",
      createdAt: Date.now(),
    });

    return teamId;
  },
});

export const update = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await requireTeamAdmin(ctx, args.teamId);

    await ctx.db.patch(args.teamId, {
      name: args.name,
    });

    return args.teamId;
  },
});

export const addMember = mutation({
  args: {
    teamId: v.id("teams"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    await requireTeamAdmin(ctx, args.teamId);

    const userToAdd = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!userToAdd) {
      throw new Error("User not found");
    }

    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", userToAdd._id)
      )
      .first();

    if (existingMembership) {
      throw new Error("User is already a member of this team");
    }

    const membershipId = await ctx.db.insert("teamMembers", {
      teamId: args.teamId,
      userId: userToAdd._id,
      role: args.role,
      createdAt: Date.now(),
    });

    return membershipId;
  },
});

export const removeMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { team } = await requireTeamAdmin(ctx, args.teamId);

    if (team.ownerId === args.userId) {
      throw new Error("Cannot remove team owner");
    }

    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("Member not found");
    }

    await ctx.db.delete(membership._id);
  },
});

export const updateMemberRole = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const { team } = await requireTeamAdmin(ctx, args.teamId);

    if (team.ownerId === args.userId) {
      throw new Error("Cannot change owner's role");
    }

    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("Member not found");
    }

    await ctx.db.patch(membership._id, {
      role: args.role,
    });
  },
});
