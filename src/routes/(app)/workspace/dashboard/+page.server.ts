import { db } from '$lib/server/db';
import { article } from '$lib/server/db/schema';
import { eq, count, desc, and, gte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Get stats for different article statuses
	const [stats, recentArticles] = await Promise.all([
		db
			.select({
				status: article.status,
				count: count(),
			})
			.from(article)
			.groupBy(article.status),

		db
			.select({
				id: article.id,
				headline: article.headline,
				status: article.status,
				updatedAt: article.updatedAt,
			})
			.from(article)
			.orderBy(desc(article.updatedAt))
			.limit(5),
	]);

	// Calculate totals
	const totalArticles = stats.reduce((sum, item) => sum + item.count, 0);
	const workingCount = stats.find((s) => s.status === 'working')?.count || 0;
	const submittedCount = stats.find((s) => s.status === 'submitted')?.count || 0;
	const publishedCount = stats.find((s) => s.status === 'published')?.count || 0;

	return {
		stats: {
			total: totalArticles,
			working: workingCount,
			submitted: submittedCount,
			published: publishedCount,
		},
		recentArticles,
	};
};
