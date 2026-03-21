import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ── NextAuth tables ──────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
)

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  })
)

// ── Workspaces ───────────────────────────────────────────

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  githubRepoUrl: text("github_repo_url"),
  driveFolderUrl: text("drive_folder_url"),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const workspaceMembers = pgTable("workspace_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // 'owner' | 'member'
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

// ── Roadmap Items ────────────────────────────────────────

export const roadmapItems = pgTable("roadmap_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("planned"), // planned | in-progress | done | parked
  quarter: text("quarter"), // e.g. "Q2-2026"
  theme: text("theme"),
  milestone: text("milestone"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

// ── Work Items ───────────────────────────────────────────

export const workItems = pgTable("work_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicId: text("public_id").notNull().unique(), // e.g. "WI-0042"
  roadmapItemId: uuid("roadmap_item_id")
    .references(() => roadmapItems.id, { onDelete: "set null" }),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // feature | bug | decision | sales-insight | ops-task
  status: text("status").notNull().default("todo"), // todo | in-progress | in-review | done | blocked | cancelled
  statusSource: text("status_source").notNull().default("manual"), // manual | github
  priority: text("priority").notNull().default("medium"), // low | medium | high | critical
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
  githubIssueNumber: integer("github_issue_number"),
  githubPrNumber: integer("github_pr_number"),
  decisionOutcome: text("decision_outcome"),
  decisionStatus: text("decision_status"), // proposed | approved | superseded
  meetExcerpt: text("meet_excerpt"),
  meetDate: timestamp("meet_date", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

// ── Signals ──────────────────────────────────────────────

export const signals = pgTable("signals", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicId: text("public_id").notNull().unique(), // e.g. "SIG-0001"
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  source: text("source").notNull().default("manual"), // manual | slack | fathom
  clientName: text("client_name"),
  arrTier: text("arr_tier").notNull().default("unknown"), // enterprise | mid-market | smb | unknown
  type: text("type").notNull(), // feature | bug | compliance | infra
  status: text("status").notNull().default("inbox"), // inbox | linked | promoted | dismissed
  notes: text("notes"),
  promotedWorkItemId: uuid("promoted_work_item_id")
    .references(() => workItems.id, { onDelete: "set null" }),
  promotedRoadmapItemId: uuid("promoted_roadmap_item_id")
    .references(() => roadmapItems.id, { onDelete: "set null" }),
  capturedAt: timestamp("captured_at", { mode: "date" }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

// ── Artefact Links ───────────────────────────────────────

export const artefactLinks = pgTable("artefact_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  workItemId: uuid("work_item_id")
    .notNull()
    .references(() => workItems.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  label: text("label").notNull(),
  type: text("type").notNull(), // google-doc | github-issue | github-pr | meet-transcript | other
  metadata: text("metadata"), // JSON string for type-specific extras
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

// ── Item Comments ────────────────────────────────────────

export const itemComments = pgTable("item_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  entityType: text("entity_type").notNull(), // 'roadmap_item' | 'work_item'
  entityId: uuid("entity_id").notNull(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

// ── Activity Log ─────────────────────────────────────────

export const activityLog = pgTable("activity_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  entityType: text("entity_type").notNull(), // 'roadmap_item' | 'work_item'
  entityId: uuid("entity_id").notNull(),
  actorId: uuid("actor_id")
    .references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(), // 'status_changed' | 'assigned' | 'linked_to_roadmap' | 'comment_added' | 'created' | ...
  metadata: text("metadata"), // JSON string: { from, to, commentId, ... }
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

// ── Relations ────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  workspaceMembers: many(workspaceMembers),
  assignedWorkItems: many(workItems),
}))

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(workspaceMembers),
  roadmapItems: many(roadmapItems),
  workItems: many(workItems),
  signals: many(signals),
  itemComments: many(itemComments),
  activityLog: many(activityLog),
}))

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id],
  }),
}))

export const roadmapItemsRelations = relations(roadmapItems, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [roadmapItems.workspaceId],
    references: [workspaces.id],
  }),
  workItems: many(workItems),
  signals: many(signals),
}))

export const workItemsRelations = relations(workItems, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [workItems.workspaceId],
    references: [workspaces.id],
  }),
  roadmapItem: one(roadmapItems, {
    fields: [workItems.roadmapItemId],
    references: [roadmapItems.id],
  }),
  assignee: one(users, {
    fields: [workItems.assigneeId],
    references: [users.id],
  }),
  artefactLinks: many(artefactLinks),
}))

export const artefactLinksRelations = relations(artefactLinks, ({ one }) => ({
  workItem: one(workItems, {
    fields: [artefactLinks.workItemId],
    references: [workItems.id],
  }),
}))

export const signalsRelations = relations(signals, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [signals.workspaceId],
    references: [workspaces.id],
  }),
  promotedWorkItem: one(workItems, {
    fields: [signals.promotedWorkItemId],
    references: [workItems.id],
  }),
  promotedRoadmapItem: one(roadmapItems, {
    fields: [signals.promotedRoadmapItemId],
    references: [roadmapItems.id],
  }),
}))

export const itemCommentsRelations = relations(itemComments, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [itemComments.workspaceId],
    references: [workspaces.id],
  }),
  author: one(users, {
    fields: [itemComments.authorId],
    references: [users.id],
  }),
}))

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [activityLog.workspaceId],
    references: [workspaces.id],
  }),
  actor: one(users, {
    fields: [activityLog.actorId],
    references: [users.id],
  }),
}))
