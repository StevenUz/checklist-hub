import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const templateStatusEnum = pgEnum("template_status", [
  "draft",
  "published",
  "archived",
]);
export const checklistStatusEnum = pgEnum("checklist_status", [
  "active",
  "completed",
  "archived",
]);
export const suggestionTypeEnum = pgEnum("suggestion_type", [
  "new_activity",
  "new_template",
  "template_edit",
  "template_variant",
]);
export const suggestionStatusEnum = pgEnum("suggestion_status", [
  "pending",
  "accepted",
  "rejected",
  "implemented",
]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role").notNull().default("user"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("categories_name_idx").on(table.name),
    uniqueIndex("categories_slug_idx").on(table.slug),
  ],
);

export const activities = pgTable(
  "activities",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict", onUpdate: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    ...timestamps,
  },
  (table) => [
    index("activities_category_id_idx").on(table.categoryId),
    uniqueIndex("activities_slug_idx").on(table.slug),
    unique("activities_category_name_unique").on(table.categoryId, table.name),
  ],
);

export const checklistTemplates = pgTable(
  "checklist_templates",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict", onUpdate: "cascade" }),
    activityId: integer("activity_id").references(() => activities.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    status: templateStatusEnum("status").notNull().default("draft"),
    versionNumber: integer("version_number").notNull().default(1),
    parentTemplateId: integer("parent_template_id"),
    createdByUserId: integer("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
    updatedByUserId: integer("updated_by_user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    ...timestamps,
  },
  (table) => [
    index("checklist_templates_category_id_idx").on(table.categoryId),
    index("checklist_templates_activity_id_idx").on(table.activityId),
    index("checklist_templates_status_idx").on(table.status),
    uniqueIndex("checklist_templates_slug_idx").on(table.slug),
    index("checklist_templates_parent_template_id_idx").on(table.parentTemplateId),
    index("checklist_templates_created_by_user_id_idx").on(table.createdByUserId),
    foreignKey({
      columns: [table.parentTemplateId],
      foreignColumns: [table.id],
      name: "checklist_templates_parent_template_id_fk",
    })
      .onDelete("set null")
      .onUpdate("cascade"),
  ],
);

export const templateSections = pgTable(
  "template_sections",
  {
    id: serial("id").primaryKey(),
    templateId: integer("template_id")
      .notNull()
      .references(() => checklistTemplates.id, { onDelete: "cascade", onUpdate: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("template_sections_template_id_idx").on(table.templateId),
    index("template_sections_template_sort_idx").on(table.templateId, table.sortOrder),
  ],
);

export const templateItems = pgTable(
  "template_items",
  {
    id: serial("id").primaryKey(),
    sectionId: integer("section_id")
      .notNull()
      .references(() => templateSections.id, { onDelete: "cascade", onUpdate: "cascade" }),
    text: text("text").notNull(),
    description: text("description"),
    isRequired: boolean("is_required").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("template_items_section_id_idx").on(table.sectionId),
    index("template_items_section_sort_idx").on(table.sectionId, table.sortOrder),
  ],
);

export const userChecklists = pgTable(
  "user_checklists",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    templateId: integer("template_id").references(() => checklistTemplates.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    title: text("title").notNull(),
    description: text("description"),
    status: checklistStatusEnum("status").notNull().default("active"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("user_checklists_user_id_idx").on(table.userId),
    index("user_checklists_status_idx").on(table.status),
    index("user_checklists_template_id_idx").on(table.templateId),
    index("user_checklists_user_status_idx").on(table.userId, table.status),
  ],
);

export const userChecklistSections = pgTable(
  "user_checklist_sections",
  {
    id: serial("id").primaryKey(),
    userChecklistId: integer("user_checklist_id")
      .notNull()
      .references(() => userChecklists.id, { onDelete: "cascade", onUpdate: "cascade" }),
    sourceTemplateSectionId: integer("source_template_section_id").references(
      () => templateSections.id,
      { onDelete: "set null", onUpdate: "cascade" },
    ),
    title: text("title").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("user_checklist_sections_user_checklist_id_idx").on(table.userChecklistId),
    index("user_checklist_sections_source_template_section_id_idx").on(
      table.sourceTemplateSectionId,
    ),
    index("user_checklist_sections_checklist_sort_idx").on(table.userChecklistId, table.sortOrder),
  ],
);

export const userChecklistItems = pgTable(
  "user_checklist_items",
  {
    id: serial("id").primaryKey(),
    userChecklistSectionId: integer("user_checklist_section_id")
      .notNull()
      .references(() => userChecklistSections.id, { onDelete: "cascade", onUpdate: "cascade" }),
    sourceTemplateItemId: integer("source_template_item_id").references(() => templateItems.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    text: text("text").notNull(),
    description: text("description"),
    isRequired: boolean("is_required").notNull().default(false),
    isCompleted: boolean("is_completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("user_checklist_items_user_checklist_section_id_idx").on(table.userChecklistSectionId),
    index("user_checklist_items_source_template_item_id_idx").on(table.sourceTemplateItemId),
    index("user_checklist_items_completion_idx").on(table.isCompleted),
    index("user_checklist_items_section_sort_idx").on(
      table.userChecklistSectionId,
      table.sortOrder,
    ),
  ],
);

export const suggestions = pgTable(
  "suggestions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    targetTemplateId: integer("target_template_id").references(() => checklistTemplates.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    type: suggestionTypeEnum("type").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: suggestionStatusEnum("status").notNull().default("pending"),
    adminNotes: text("admin_notes"),
    reviewedByUserId: integer("reviewed_by_user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("suggestions_user_id_idx").on(table.userId),
    index("suggestions_status_idx").on(table.status),
    index("suggestions_target_template_id_idx").on(table.targetTemplateId),
    index("suggestions_reviewed_by_user_id_idx").on(table.reviewedByUserId),
    index("suggestions_status_created_at_idx").on(table.status, table.createdAt),
  ],
);

export const suggestionComments = pgTable(
  "suggestion_comments",
  {
    id: serial("id").primaryKey(),
    suggestionId: integer("suggestion_id")
      .notNull()
      .references(() => suggestions.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    text: text("text").notNull(),
    ...timestamps,
  },
  (table) => [
    index("suggestion_comments_suggestion_id_idx").on(table.suggestionId),
    index("suggestion_comments_user_id_idx").on(table.userId),
  ],
);

export const templateRatings = pgTable(
  "template_ratings",
  {
    id: serial("id").primaryKey(),
    templateId: integer("template_id")
      .notNull()
      .references(() => checklistTemplates.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    ...timestamps,
  },
  (table) => [
    index("template_ratings_template_id_idx").on(table.templateId),
    index("template_ratings_user_id_idx").on(table.userId),
    unique("template_ratings_template_user_unique").on(table.templateId, table.userId),
    check("template_ratings_rating_check", sql`${table.rating} between 1 and 5`),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: integer("entity_id"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_user_id_idx").on(table.userId),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  createdTemplates: many(checklistTemplates, { relationName: "createdTemplates" }),
  updatedTemplates: many(checklistTemplates, { relationName: "updatedTemplates" }),
  userChecklists: many(userChecklists),
  suggestions: many(suggestions, { relationName: "userSuggestions" }),
  reviewedSuggestions: many(suggestions, { relationName: "reviewedSuggestions" }),
  suggestionComments: many(suggestionComments),
  templateRatings: many(templateRatings),
  auditLogs: many(auditLogs),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  activities: many(activities),
  checklistTemplates: many(checklistTemplates),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  category: one(categories, {
    fields: [activities.categoryId],
    references: [categories.id],
  }),
  checklistTemplates: many(checklistTemplates),
}));

export const checklistTemplatesRelations = relations(checklistTemplates, ({ one, many }) => ({
  category: one(categories, {
    fields: [checklistTemplates.categoryId],
    references: [categories.id],
  }),
  activity: one(activities, {
    fields: [checklistTemplates.activityId],
    references: [activities.id],
  }),
  parentTemplate: one(checklistTemplates, {
    fields: [checklistTemplates.parentTemplateId],
    references: [checklistTemplates.id],
    relationName: "templateVersions",
  }),
  childTemplates: many(checklistTemplates, { relationName: "templateVersions" }),
  createdByUser: one(users, {
    fields: [checklistTemplates.createdByUserId],
    references: [users.id],
    relationName: "createdTemplates",
  }),
  updatedByUser: one(users, {
    fields: [checklistTemplates.updatedByUserId],
    references: [users.id],
    relationName: "updatedTemplates",
  }),
  sections: many(templateSections),
  userChecklists: many(userChecklists),
  suggestions: many(suggestions),
  ratings: many(templateRatings),
}));

export const templateSectionsRelations = relations(templateSections, ({ one, many }) => ({
  template: one(checklistTemplates, {
    fields: [templateSections.templateId],
    references: [checklistTemplates.id],
  }),
  items: many(templateItems),
  userChecklistSections: many(userChecklistSections),
}));

export const templateItemsRelations = relations(templateItems, ({ one, many }) => ({
  section: one(templateSections, {
    fields: [templateItems.sectionId],
    references: [templateSections.id],
  }),
  userChecklistItems: many(userChecklistItems),
}));

export const userChecklistsRelations = relations(userChecklists, ({ one, many }) => ({
  user: one(users, {
    fields: [userChecklists.userId],
    references: [users.id],
  }),
  template: one(checklistTemplates, {
    fields: [userChecklists.templateId],
    references: [checklistTemplates.id],
  }),
  sections: many(userChecklistSections),
}));

export const userChecklistSectionsRelations = relations(userChecklistSections, ({ one, many }) => ({
  userChecklist: one(userChecklists, {
    fields: [userChecklistSections.userChecklistId],
    references: [userChecklists.id],
  }),
  sourceTemplateSection: one(templateSections, {
    fields: [userChecklistSections.sourceTemplateSectionId],
    references: [templateSections.id],
  }),
  items: many(userChecklistItems),
}));

export const userChecklistItemsRelations = relations(userChecklistItems, ({ one }) => ({
  userChecklistSection: one(userChecklistSections, {
    fields: [userChecklistItems.userChecklistSectionId],
    references: [userChecklistSections.id],
  }),
  sourceTemplateItem: one(templateItems, {
    fields: [userChecklistItems.sourceTemplateItemId],
    references: [templateItems.id],
  }),
}));

export const suggestionsRelations = relations(suggestions, ({ one, many }) => ({
  user: one(users, {
    fields: [suggestions.userId],
    references: [users.id],
    relationName: "userSuggestions",
  }),
  targetTemplate: one(checklistTemplates, {
    fields: [suggestions.targetTemplateId],
    references: [checklistTemplates.id],
  }),
  reviewedByUser: one(users, {
    fields: [suggestions.reviewedByUserId],
    references: [users.id],
    relationName: "reviewedSuggestions",
  }),
  comments: many(suggestionComments),
}));

export const suggestionCommentsRelations = relations(suggestionComments, ({ one }) => ({
  suggestion: one(suggestions, {
    fields: [suggestionComments.suggestionId],
    references: [suggestions.id],
  }),
  user: one(users, {
    fields: [suggestionComments.userId],
    references: [users.id],
  }),
}));

export const templateRatingsRelations = relations(templateRatings, ({ one }) => ({
  template: one(checklistTemplates, {
    fields: [templateRatings.templateId],
    references: [checklistTemplates.id],
  }),
  user: one(users, {
    fields: [templateRatings.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
