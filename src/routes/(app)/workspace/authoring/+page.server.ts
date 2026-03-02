import { db } from '$lib/server/db';
import { article, user } from '$lib/server/db/schema';
import { eq, desc, like, or, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const status = url.searchParams.get('status') || '';
	const search = url.searchParams.get('q') || '';

	const conditions = [];

	if (status && status !== 'all') {
		conditions.push(eq(article.status, status as 'draft' | 'working' | 'submitted' | 'published' | 'archived'));
	}

	if (search) {
		conditions.push(
			or(
				like(article.headline, `%${search}%`),
				like(article.excerpt, `%${search}%`),
			)
		);
	}

	const articles = await db
		.select({
			id: article.id,
			headline: article.headline,
			excerpt: article.excerpt,
			status: article.status,
			priority: article.priority,
			wordCount: article.wordCount,
			featured: article.featured,
			createdAt: article.createdAt,
			updatedAt: article.updatedAt,
			publishedAt: article.publishedAt,
			author: {
				id: user.id,
				name: user.name,
				image: user.image,
			},
		})
		.from(article)
		.leftJoin(user, eq(article.authorId, user.id))
		.where(conditions.length > 0 ? and(...conditions) : undefined)
		.orderBy(desc(article.updatedAt))
		.limit(50);

	return {
		articles,
		filters: { status, search },
	};
};
