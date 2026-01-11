import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function requireTeamAccess(
  ctx: QueryCtx | MutationCtx,
  teamId: Id<"teams">
) {
  const user = await getCurrentUser(ctx);

  const membership = await ctx.db
    .query("teamMembers")
    .withIndex("by_team_and_user", (q) =>
      q.eq("teamId", teamId).eq("userId", user._id)
    )
    .first();

  if (!membership) {
    throw new Error("Access denied: You are not a member of this team");
  }

  return { user, membership };
}

export async function requireTeamAdmin(
  ctx: QueryCtx | MutationCtx,
  teamId: Id<"teams">
) {
  const { user, membership } = await requireTeamAccess(ctx, teamId);

  const team = await ctx.db.get(teamId);
  if (!team) {
    throw new Error("Team not found");
  }

  if (membership.role !== "admin" && team.ownerId !== user._id) {
    throw new Error("Access denied: Admin privileges required");
  }

  return { user, membership, team };
}
