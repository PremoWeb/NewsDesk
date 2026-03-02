import { db } from '$lib/server/db';
import { article, user, tag, articleTag, category, articleCategory, customField, articleCustomFieldValue } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [art] = await db
		.select({
			id: article.id,
			headline: article.headline,
			slug: article.slug,
			byline: article.byline,
			excerpt: article.excerpt,
			body: article.body,
			status: article.status,
			priority: article.priority,
			featured: article.featured,
			wordCount: article.wordCount,
			readTime: article.readTime,
			publishedAt: article.publishedAt,
			scheduledFor: article.scheduledFor,
			createdAt: article.createdAt,
			updatedAt: article.updatedAt,
			authorId: article.authorId,
			assignedTo: article.assignedTo,
			author: {
				id: user.id,
				name: user.name,
			},
		})
		.from(article)
		.leftJoin(user, eq(article.authorId, user.id))
		.where(eq(article.id, params.id))
		.limit(1);

	if (!art) {
		error(404, 'Article not found');
	}

	const authors = await db
		.select({ id: user.id, name: user.name })
		.from(user)
		.orderBy(user.name);

	// Fetch current article tags
	const articleTags = await db
		.select({ name: tag.name })
		.from(articleTag)
		.innerJoin(tag, eq(articleTag.tagId, tag.id))
		.where(eq(articleTag.articleId, params.id));

	// Fetch all categories
	const categories = await db
		.select({ id: category.id, name: category.name, slug: category.slug })
		.from(category)
		.orderBy(category.name);

	// Fetch article categories
	const artCategories = await db
		.select({ id: category.id })
		.from(articleCategory)
		.innerJoin(category, eq(articleCategory.categoryId, category.id))
		.where(eq(articleCategory.articleId, params.id));

	// Fetch all custom field definitions
	const customFields = await db
		.select()
		.from(customField)
		.orderBy(customField.name);

	// Fetch this article's custom field values
	const cfValues = await db
		.select({ fieldId: articleCustomFieldValue.fieldId, value: articleCustomFieldValue.value })
		.from(articleCustomFieldValue)
		.where(eq(articleCustomFieldValue.articleId, params.id));

	const customFieldValues = Object.fromEntries(cfValues.map((v) => [v.fieldId, v.value ?? '']));

	return {
		article: art,
		authors,
		tags: articleTags.map((t) => t.name),
		categories,
		articleCategories: artCategories.map((c) => c.id),
		customFields,
		customFieldValues,
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const data = await request.formData();

		const headline = data.get('headline')?.toString().trim();
		const byline = data.get('byline')?.toString().trim() || null;
		const excerpt = data.get('excerpt')?.toString().trim() || null;
		const body = data.get('body')?.toString().trim() || null;
		const status = data.get('status')?.toString() as
			| 'draft'
			| 'working'
			| 'submitted'
			| 'published'
			| 'archived';
		const priority = data.get('priority')?.toString() as 'low' | 'medium' | 'high' | 'urgent';
		const authorId = data.get('authorId')?.toString();
		const featured = data.get('featured') === 'on';

		if (!headline) {
			return fail(400, { error: 'Headline is required' });
		}

		if (!authorId) {
			return fail(400, { error: 'Author is required' });
		}

		const wordCount = body
			? body.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
			: 0;
		const readTime = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 0;

		await db
			.update(article)
			.set({
				headline,
				byline,
				excerpt,
				body,
				status,
				priority,
				authorId,
				featured,
				wordCount,
				readTime,
				updatedAt: new Date(),
				...(status === 'published' ? { publishedAt: new Date() } : {}),
			})
			.where(eq(article.id, params.id));

		// Handle tags: delete all existing then re-insert
		await db.delete(articleTag).where(eq(articleTag.articleId, params.id));
		const rawTags = data.get('tags')?.toString() ?? '';
		const tagNames = rawTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
		for (const name of tagNames) {
			const tagSlug = name.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
			// Find or create tag (check-first to avoid unique constraint errors)
			let [existingTag] = await db.select({ id: tag.id }).from(tag).where(eq(tag.name, name)).limit(1);
			if (!existingTag) {
				const [inserted] = await db
					.insert(tag)
					.values({ id: nanoid(), name, slug: tagSlug })
					.returning({ id: tag.id });
				existingTag = inserted;
			}
			await db.insert(articleTag).values({ articleId: params.id, tagId: existingTag.id }).onConflictDoNothing();
		}

		// Handle categories: delete all existing then re-insert
		await db.delete(articleCategory).where(eq(articleCategory.articleId, params.id));
		const rawCategories = data.getAll('categories[]').map((c) => c.toString()).filter(Boolean);
		for (const catId of rawCategories) {
			await db.insert(articleCategory).values({ articleId: params.id, categoryId: catId }).onConflictDoNothing();
		}

		// Handle custom field values: upsert each submitted value
		const allFields = await db.select({ id: customField.id, type: customField.type }).from(customField);
		for (const field of allFields) {
			const key = `cf_${field.id}`;
			const rawValue = data.get(key);
			if (rawValue === null) continue;
			let value: string;
			if (field.type === 'boolean') {
				value = rawValue === 'on' ? 'true' : 'false';
			} else {
				value = rawValue.toString().trim();
			}
			await db
				.insert(articleCustomFieldValue)
				.values({ articleId: params.id, fieldId: field.id, value })
				.onConflictDoUpdate({
					target: [articleCustomFieldValue.articleId, articleCustomFieldValue.fieldId],
					set: { value },
				});
		}

		return { success: true };
	},

	delete: async ({ params }) => {
		await db.delete(article).where(eq(article.id, params.id));
		redirect(303, '/workspace/authoring');
	},
};
