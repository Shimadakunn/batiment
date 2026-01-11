import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireTeamAccess } from "./helpers/authorization";

export const getStats = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.teamId);

    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const activeProjects = projects.filter((p) => p.status === "active");
    const completedProjects = projects.filter((p) => p.status === "completed");
    const pendingTasks = tasks.filter((t) => t.status === "todo" || t.status === "in_progress");

    const totalValue = projects
      .filter((p) => p.status === "active" || p.status === "completed")
      .reduce((sum, p) => sum + (p.value || 0), 0);

    return {
      totalContacts: contacts.length,
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      pendingTasks: pendingTasks.length,
      totalTasks: tasks.length,
      totalValue,
    };
  },
});

export const getRecentActivities = query({
  args: { teamId: v.id("teams"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.teamId);

    const activities = await ctx.db
      .query("activities")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .take(args.limit || 10);

    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const contact = activity.contactId
          ? await ctx.db.get(activity.contactId)
          : null;
        const project = activity.projectId
          ? await ctx.db.get(activity.projectId)
          : null;
        const user = await ctx.db.get(activity.createdBy);

        return {
          ...activity,
          contactName: contact?.name,
          projectTitle: project?.title,
          userName: user?.name || user?.email,
        };
      })
    );

    return enrichedActivities;
  },
});

export const getProjectsPipeline = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.teamId);

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const pipeline = {
      lead: projects.filter((p) => p.status === "lead"),
      quote: projects.filter((p) => p.status === "quote"),
      active: projects.filter((p) => p.status === "active"),
      completed: projects.filter((p) => p.status === "completed"),
      cancelled: projects.filter((p) => p.status === "cancelled"),
    };

    const pipelineValue = {
      lead: pipeline.lead.reduce((sum, p) => sum + (p.value || 0), 0),
      quote: pipeline.quote.reduce((sum, p) => sum + (p.value || 0), 0),
      active: pipeline.active.reduce((sum, p) => sum + (p.value || 0), 0),
      completed: pipeline.completed.reduce((sum, p) => sum + (p.value || 0), 0),
    };

    return {
      counts: {
        lead: pipeline.lead.length,
        quote: pipeline.quote.length,
        active: pipeline.active.length,
        completed: pipeline.completed.length,
        cancelled: pipeline.cancelled.length,
      },
      values: pipelineValue,
    };
  },
});
