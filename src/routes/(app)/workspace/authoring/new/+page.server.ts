import { db } from '$lib/server/db';
import { article, user, tag, articleTag, category, articleCategory } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Get available authors (will use session user when auth is enabled)
	const authors = await db
		.select({ id: user.id, name: user.name })
		.from(user)
		.limit(20);

	// Get all categories for the picker
	const categories = await db
		.select({ id: category.id, name: category.name, slug: category.slug })
		.from(category)
		.orderBy(category.name);

	return { authors, categories };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();

		const headline = data.get('headline')?.toString().trim();
		const byline = data.get('byline')?.toString().trim() || null;
		const excerpt = data.get('excerpt')?.toString().trim() || null;
		const body = data.get('body')?.toString().trim() || null;
		const status = (data.get('status')?.toString() || 'draft') as 'draft' | 'working' | 'submitted' | 'published' | 'archived';
		const priority = (data.get('priority')?.toString() || 'medium') as 'low' | 'medium' | 'high' | 'urgent';
		const authorId = data.get('authorId')?.toString();

		if (!headline) {
			return fail(400, { error: 'Headline is required', headline, byline, excerpt, body, status, priority, authorId: authorId ?? '' });
		}

		if (!authorId) {
			return fail(400, { error: 'Author is required', headline, byline, excerpt, body, status, priority, authorId: '' });
		}

		// Generate a slug from the headline
		const slug = headline
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.substring(0, 80)
			+ '-' + nanoid(6);

		// Calculate word count (strip HTML tags first since body is rich text)
		const wordCount = body
			? body.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
			: 0;
		const readTime = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 0;

		const id = nanoid();

		await db.insert(article).values({
			id,
			headline,
			slug,
			byline,
			excerpt,
			body,
			status,
			priority,
			authorId,
			wordCount,
			readTime,
			featured: false,
		});

		// Handle tags
		const rawTags = data.get('tags')?.toString() ?? '';
		const tagNames = rawTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
		if (tagNames.length > 0) {
			for (const name of tagNames) {
				const tagSlug = name.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
				// Upsert tag atomically: insert with ON CONFLICT DO NOTHING, then re-fetch if needed
				const [inserted] = await db
					.insert(tag)
					.values({ id: nanoid(), name, slug: tagSlug })
					.onConflictDoNothing()
					.returning({ id: tag.id });
				const tagId = inserted?.id ??
					(await db.select({ id: tag.id }).from(tag).where(eq(tag.name, name)).limit(1))[0]?.id;
				if (tagId) {
					await db.insert(articleTag).values({ articleId: id, tagId }).onConflictDoNothing();
				}
			}
		}

		// Handle categories
		const rawCategories = data.getAll('categories[]').map((c) => c.toString()).filter(Boolean);
		for (const catId of rawCategories) {
			await db.insert(articleCategory).values({ articleId: id, categoryId: catId }).onConflictDoNothing();
		}

		redirect(303, `/workspace/authoring/${id}`);
	},
};
