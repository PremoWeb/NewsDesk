import { db } from '$lib/server/db';
import { article, user } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const baseSelect = {
	id: article.id,
	headline: article.headline,
	excerpt: article.excerpt,
	status: article.status,
	priority: article.priority,
	updatedAt: article.updatedAt,
	publishedAt: article.publishedAt,
	author: {
		id: user.id,
		name: user.name,
		image: user.image,
	},
};

export const load: PageServerLoad = async () => {
	const working = await db
		.select(baseSelect)
		.from(article)
		.leftJoin(user, eq(article.authorId, user.id))
		.where(eq(article.status, 'working'))
		.orderBy(desc(article.updatedAt))
		.limit(20);

	const submitted = await db
		.select(baseSelect)
		.from(article)
		.leftJoin(user, eq(article.authorId, user.id))
		.where(eq(article.status, 'submitted'))
		.orderBy(desc(article.updatedAt))
		.limit(20);

	const published = await db
		.select(baseSelect)
		.from(article)
		.leftJoin(user, eq(article.authorId, user.id))
		.where(eq(article.status, 'published'))
		.orderBy(desc(article.publishedAt))
		.limit(20);

	return {
		articles: { working, submitted, published },
	};
};

