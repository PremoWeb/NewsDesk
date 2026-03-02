import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, integer, pgEnum, index } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

// Article status enum
export const articleStatusEnum = pgEnum('article_status', [
	'draft',
	'working',
	'submitted',
	'published',
	'archived'
]);

// Article priority enum
export const articlePriorityEnum = pgEnum('article_priority', [
	'low',
	'medium',
	'high',
	'urgent'
]);

// Articles table
export const article = pgTable(
	"article",
	{
		id: text("id").primaryKey(),
		headline: text("headline").notNull(),
		slug: text("slug").notNull().unique(),
		byline: text("byline"),
		body: text("body"),
		excerpt: text("excerpt"),
		status: articleStatusEnum("status").default('draft').notNull(),
		priority: articlePriorityEnum("priority").default('medium').notNull(),
		publishedAt: timestamp("published_at"),
		scheduledFor: timestamp("scheduled_for"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		assignedTo: text("assigned_to").references(() => user.id, { onDelete: "set null" }),
		wordCount: integer("word_count").default(0),
		readTime: integer("read_time").default(0),
		featured: boolean("featured").default(false).notNull(),
	},
	(table) => [
		index("article_authorId_idx").on(table.authorId),
		index("article_assignedTo_idx").on(table.assignedTo),
		index("article_status_idx").on(table.status),
		index("article_publishedAt_idx").on(table.publishedAt),
	],
);

// Categories table
export const category = pgTable("category", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	slug: text("slug").notNull().unique(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tags table
export const tag = pgTable("tag", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	slug: text("slug").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Article categories junction table
export const articleCategory = pgTable(
	"article_category",
	{
		articleId: text("article_id")
			.notNull()
			.references(() => article.id, { onDelete: "cascade" }),
		categoryId: text("category_id")
			.notNull()
			.references(() => category.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("article_category_articleId_idx").on(table.articleId),
		index("article_category_categoryId_idx").on(table.categoryId),
	],
);

// Article tags junction table
export const articleTag = pgTable(
	"article_tag",
	{
		articleId: text("article_id")
			.notNull()
			.references(() => article.id, { onDelete: "cascade" }),
		tagId: text("tag_id")
			.notNull()
			.references(() => tag.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("article_tag_articleId_idx").on(table.articleId),
		index("article_tag_tagId_idx").on(table.tagId),
	],
);

// Custom fields definition table
export const customField = pgTable("custom_field", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	slug: text("slug").notNull().unique(),
	type: text("type").notNull().default("text"), // text | number | boolean | date | select
	options: text("options"), // JSON array string for select type: '["opt1","opt2"]'
	required: boolean("required").notNull().default(false),
	defaultValue: text("default_value"),
	placeholder: text("placeholder"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Article custom field values junction
export const articleCustomFieldValue = pgTable(
	"article_custom_field_value",
	{
		articleId: text("article_id")
			.notNull()
			.references(() => article.id, { onDelete: "cascade" }),
		fieldId: text("field_id")
			.notNull()
			.references(() => customField.id, { onDelete: "cascade" }),
		value: text("value"),
	},
	(table) => [
		index("article_custom_field_articleId_idx").on(table.articleId),
		index("article_custom_field_fieldId_idx").on(table.fieldId),
	],
);

// Media assets table
export const mediaAsset = pgTable(
	"media_asset",
	{
		id: text("id").primaryKey(),
		filename: text("filename").notNull(),
		originalName: text("original_name").notNull(),
		mimeType: text("mime_type").notNull(),
		size: integer("size").notNull(),
		url: text("url").notNull(),
		caption: text("caption"),
		altText: text("alt_text"),
		credit: text("credit"),
		width: integer("width"),
		height: integer("height"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		uploadedBy: text("uploaded_by")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("media_asset_uploadedBy_idx").on(table.uploadedBy),
		index("media_asset_mimeType_idx").on(table.mimeType),
	],
);

// Planning events table
export const planningEvent = pgTable(
	"planning_event",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		location: text("location"),
		startAt: timestamp("start_at").notNull(),
		endAt: timestamp("end_at"),
		status: text("status").notNull().default("active"), // active | cancelled | completed
		createdAt: timestamp("created_at").defaultNow().notNull(),
		createdBy: text("created_by")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("planning_event_startAt_idx").on(table.startAt),
		index("planning_event_status_idx").on(table.status),
	],
);

// Planning items (coverage plans linked to events)
export const planningItem = pgTable(
	"planning_item",
	{
		id: text("id").primaryKey(),
		eventId: text("event_id").references(() => planningEvent.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		description: text("description"),
		coverageType: text("coverage_type").notNull().default("text"), // text | photo | video | live
		status: text("status").notNull().default("unassigned"), // unassigned | assigned | in_progress | complete | cancelled
		assignedTo: text("assigned_to").references(() => user.id, { onDelete: "set null" }),
		articleId: text("article_id").references(() => article.id, { onDelete: "set null" }),
		deadline: timestamp("deadline"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		createdBy: text("created_by")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("planning_item_eventId_idx").on(table.eventId),
		index("planning_item_assignedTo_idx").on(table.assignedTo),
		index("planning_item_status_idx").on(table.status),
	],
);

// Desks table (newsroom organizational units)
export const desk = pgTable("desk", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	description: text("description"),
	color: text("color").notNull().default("#6366f1"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

// Stages table (workflow stages within a desk)
export const stage = pgTable(
	"stage",
	{
		id: text("id").primaryKey(),
		deskId: text("desk_id")
			.notNull()
			.references(() => desk.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		order: integer("order").notNull().default(0),
		color: text("color").notNull().default("#94a3b8"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("stage_deskId_idx").on(table.deskId),
		index("stage_order_idx").on(table.order),
	],
);

// Article comments table
export const articleComment = pgTable(
	"article_comment",
	{
		id: text("id").primaryKey(),
		articleId: text("article_id")
			.notNull()
			.references(() => article.id, { onDelete: "cascade" }),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		body: text("body").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
		resolvedAt: timestamp("resolved_at"),
	},
	(table) => [
		index("article_comment_articleId_idx").on(table.articleId),
		index("article_comment_authorId_idx").on(table.authorId),
	],
);

// Relations
export const articleRelations = relations(article, ({ one, many }) => ({
	author: one(user, { fields: [article.authorId], references: [user.id] }),
	assignedUser: one(user, { fields: [article.assignedTo], references: [user.id] }),
	articleCategories: many(articleCategory),
	articleTags: many(articleTag),
	customFieldValues: many(articleCustomFieldValue),
	comments: many(articleComment),
}));

export const categoryRelations = relations(category, ({ many }) => ({
	articleCategories: many(articleCategory),
}));

export const tagRelations = relations(tag, ({ many }) => ({
	articleTags: many(articleTag),
}));

export const articleCategoryRelations = relations(articleCategory, ({ one }) => ({
	article: one(article, { fields: [articleCategory.articleId], references: [article.id] }),
	category: one(category, { fields: [articleCategory.categoryId], references: [category.id] }),
}));

export const articleTagRelations = relations(articleTag, ({ one }) => ({
	article: one(article, { fields: [articleTag.articleId], references: [article.id] }),
	tag: one(tag, { fields: [articleTag.tagId], references: [tag.id] }),
}));

export const customFieldRelations = relations(customField, ({ many }) => ({
	values: many(articleCustomFieldValue),
}));

export const articleCustomFieldValueRelations = relations(articleCustomFieldValue, ({ one }) => ({
	article: one(article, { fields: [articleCustomFieldValue.articleId], references: [article.id] }),
	field: one(customField, { fields: [articleCustomFieldValue.fieldId], references: [customField.id] }),
}));

export const mediaAssetRelations = relations(mediaAsset, ({ one }) => ({
	uploader: one(user, { fields: [mediaAsset.uploadedBy], references: [user.id] }),
}));

export const planningEventRelations = relations(planningEvent, ({ one, many }) => ({
	creator: one(user, { fields: [planningEvent.createdBy], references: [user.id] }),
	planningItems: many(planningItem),
}));

export const planningItemRelations = relations(planningItem, ({ one }) => ({
	event: one(planningEvent, { fields: [planningItem.eventId], references: [planningEvent.id] }),
	assignedUser: one(user, { fields: [planningItem.assignedTo], references: [user.id] }),
	article: one(article, { fields: [planningItem.articleId], references: [article.id] }),
	creator: one(user, { fields: [planningItem.createdBy], references: [user.id] }),
}));

export const deskRelations = relations(desk, ({ one, many }) => ({
	creator: one(user, { fields: [desk.createdBy], references: [user.id] }),
	stages: many(stage),
}));

export const stageRelations = relations(stage, ({ one }) => ({
	desk: one(desk, { fields: [stage.deskId], references: [desk.id] }),
}));

export const articleCommentRelations = relations(articleComment, ({ one }) => ({
	article: one(article, { fields: [articleComment.articleId], references: [article.id] }),
	author: one(user, { fields: [articleComment.authorId], references: [user.id] }),
}));
