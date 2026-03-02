import { db } from '$lib/server/db';
import { article, user, tag, articleTag } from '$lib/server/db/schema';
import { eq, desc, ilike, or, and, inArray } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const status = url.searchParams.get('status') ?? 'all';

	const baseSelect = {
		id: article.id,
		headline: article.headline,
		slug: article.slug,
		excerpt: article.excerpt,
		status: article.status,
		priority: article.priority,
		wordCount: article.wordCount,
		readTime: article.readTime,
		updatedAt: article.updatedAt,
		publishedAt: article.publishedAt,
		createdAt: article.createdAt,
		author: {
			id: user.id,
			name: user.name,
		},
	};

	// Build where clause
	const conditions = [];

	if (q) {
		conditions.push(
			or(
				ilike(article.headline, `%${q}%`),
				ilike(article.excerpt, `%${q}%`),
				ilike(article.byline, `%${q}%`),
			)!
		);
	}

	if (status && status !== 'all') {
		conditions.push(eq(article.status, status as 'draft' | 'working' | 'submitted' | 'published' | 'archived'));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const results = await db
		.select(baseSelect)
		.from(article)
		.leftJoin(user, eq(article.authorId, user.id))
		.where(whereClause)
		.orderBy(desc(article.updatedAt))
		.limit(50);

	// For each result, fetch its tags
	const articleIds = results.map((r) => r.id);
	let tagsByArticle: Record<string, string[]> = {};

	if (articleIds.length > 0) {
		const tagRows = await db
			.select({
				articleId: articleTag.articleId,
				name: tag.name,
			})
			.from(articleTag)
			.innerJoin(tag, eq(articleTag.tagId, tag.id))
			.where(inArray(articleTag.articleId, articleIds));

		for (const row of tagRows) {
			if (!tagsByArticle[row.articleId]) tagsByArticle[row.articleId] = [];
			tagsByArticle[row.articleId].push(row.name);
		}
	}

	return {
		results: results.map((r) => ({ ...r, tags: tagsByArticle[r.id] ?? [] })),
		q,
		status,
		total: results.length,
	};
};
