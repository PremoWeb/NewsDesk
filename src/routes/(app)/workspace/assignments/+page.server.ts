import { db } from '$lib/server/db';
import { article, user } from '$lib/server/db/schema';
import { isNotNull, eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const assignee = db.$with('assignee').as(
	// alias for a clean join
	db.select().from(user)
);

export const load: PageServerLoad = async () => {
	const assigned = await db
		.select({
			id: article.id,
			headline: article.headline,
			excerpt: article.excerpt,
			status: article.status,
			priority: article.priority,
			updatedAt: article.updatedAt,
			deadline: article.scheduledFor,
			author: {
				id: user.id,
				name: user.name,
				image: user.image,
			},
		})
		.from(article)
		.leftJoin(user, eq(article.authorId, user.id))
		.where(isNotNull(article.assignedTo))
		.orderBy(desc(article.updatedAt));

	// Fetch assignee info separately
	const assignedWithUser = await Promise.all(
		assigned.map(async (a) => {
			const articleRow = await db
				.select({ assignedTo: article.assignedTo })
				.from(article)
				.where(eq(article.id, a.id))
				.limit(1);

			const assignedToId = articleRow[0]?.assignedTo;
			if (!assignedToId) return { ...a, assignee: null };

			const assigneeRow = await db
				.select({ id: user.id, name: user.name, image: user.image })
				.from(user)
				.where(eq(user.id, assignedToId))
				.limit(1);

			return { ...a, assignee: assigneeRow[0] ?? null };
		})
	);

	// Group by assignee
	const byAssignee = new Map<string, { assignee: { id: string; name: string; image: string | null } | null; articles: typeof assignedWithUser }>();
	for (const a of assignedWithUser) {
		const key = a.assignee?.id ?? 'unassigned';
		if (!byAssignee.has(key)) {
			byAssignee.set(key, { assignee: a.assignee, articles: [] });
		}
		byAssignee.get(key)!.articles.push(a);
	}

	const allUsers = await db.select({ id: user.id, name: user.name, image: user.image }).from(user);

	return {
		groups: Array.from(byAssignee.values()),
		allUsers,
		totalAssigned: assigned.length,
	};
};
