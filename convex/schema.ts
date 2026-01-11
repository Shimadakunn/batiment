import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  teams: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    createdAt: v.number(),
  }),

  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
    createdAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_and_user", ["teamId", "userId"]),

  contacts: defineTable({
    teamId: v.id("teams"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    tags: v.array(v.string()),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_team_and_name", ["teamId", "name"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["teamId"],
    }),

  projects: defineTable({
    teamId: v.id("teams"),
    contactId: v.id("contacts"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("lead"),
      v.literal("quote"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    value: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    assignedTo: v.optional(v.id("users")),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_contact", ["contactId"])
    .index("by_status", ["teamId", "status"])
    .index("by_assigned", ["assignedTo"]),

  activities: defineTable({
    teamId: v.id("teams"),
    contactId: v.optional(v.id("contacts")),
    projectId: v.optional(v.id("projects")),
    type: v.union(
      v.literal("call"),
      v.literal("email"),
      v.literal("meeting"),
      v.literal("site_visit"),
      v.literal("note")
    ),
    subject: v.string(),
    notes: v.optional(v.string()),
    date: v.number(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_contact", ["contactId"])
    .index("by_project", ["projectId"])
    .index("by_date", ["teamId", "date"]),

  tasks: defineTable({
    teamId: v.id("teams"),
    projectId: v.optional(v.id("projects")),
    contactId: v.optional(v.id("contacts")),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.optional(v.number()),
    assignedTo: v.optional(v.id("users")),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_project", ["projectId"])
    .index("by_assigned", ["assignedTo"])
    .index("by_status", ["teamId", "status"]),

  files: defineTable({
    teamId: v.id("teams"),
    projectId: v.optional(v.id("projects")),
    contactId: v.optional(v.id("contacts")),
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    uploadedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_project", ["projectId"])
    .index("by_contact", ["contactId"]),
});
