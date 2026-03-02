import { db } from '$lib/server/db';
import { article, user } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

const baseSelect = {
	id: article.id,
	headline: article.headline,
	excerpt: article.excerpt,
	slug: article.slug,
	status: article.status,
	priority: article.priority,
	wordCount: article.wordCount,
	updatedAt: article.updatedAt,
	publishedAt: article.publishedAt,
	createdAt: article.createdAt,
	author: {
		id: user.id,
		name: user.name,
		image: user.image,
	},
};

export const load: PageServerLoad = async () => {
	const articles = await db
		.select(baseSelect)
		.from(article)
		.leftJoin(user, eq(article.authorId, user.id))
		.where(eq(article.status, 'archived'))
		.orderBy(desc(article.updatedAt));

	return { articles };
};

export const actions: Actions = {
	restore: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'Missing article ID' });

		await db.update(article).set({ status: 'draft' }).where(eq(article.id, id));
		return { success: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'Missing article ID' });

		await db.delete(article).where(eq(article.id, id));
		return { success: true };
	},
};
