import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireTeamAccess } from "./helpers/authorization";

export const list = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.teamId);

    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .collect();

    return contacts;
  },
});

export const get = query({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);
    if (!contact) {
      throw new Error("Contact not found");
    }

    await requireTeamAccess(ctx, contact.teamId);
    return contact;
  },
});

export const search = query({
  args: {
    teamId: v.id("teams"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.teamId);

    const contacts = await ctx.db
      .query("contacts")
      .withSearchIndex("search_name", (q) =>
        q.search("name", args.searchTerm).eq("teamId", args.teamId)
      )
      .collect();

    return contacts;
  },
});

export const create = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    tags: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user } = await requireTeamAccess(ctx, args.teamId);

    const contactId = await ctx.db.insert("contacts", {
      teamId: args.teamId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      company: args.company,
      address: args.address,
      tags: args.tags,
      notes: args.notes,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return contactId;
  },
});

export const update = mutation({
  args: {
    id: v.id("contacts"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);
    if (!contact) {
      throw new Error("Contact not found");
    }

    await requireTeamAccess(ctx, contact.teamId);

    await ctx.db.patch(args.id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.email !== undefined && { email: args.email }),
      ...(args.phone !== undefined && { phone: args.phone }),
      ...(args.company !== undefined && { company: args.company }),
      ...(args.address !== undefined && { address: args.address }),
      ...(args.tags !== undefined && { tags: args.tags }),
      ...(args.notes !== undefined && { notes: args.notes }),
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);
    if (!contact) {
      throw new Error("Contact not found");
    }

    await requireTeamAccess(ctx, contact.teamId);

    await ctx.db.delete(args.id);
  },
});
