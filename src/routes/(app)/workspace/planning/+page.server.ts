import { db } from '$lib/server/db';
import { planningEvent, planningItem, user, article } from '$lib/server/db/schema';
import { eq, desc, asc, isNull } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const currentUser = locals.user;

	const events = await db
		.select({
			id: planningEvent.id,
			title: planningEvent.title,
			description: planningEvent.description,
			location: planningEvent.location,
			startAt: planningEvent.startAt,
			endAt: planningEvent.endAt,
			status: planningEvent.status,
			createdAt: planningEvent.createdAt,
			creator: {
				id: user.id,
				name: user.name,
				image: user.image,
			},
		})
		.from(planningEvent)
		.leftJoin(user, eq(planningEvent.createdBy, user.id))
		.orderBy(asc(planningEvent.startAt));

	const items = await db
		.select({
			id: planningItem.id,
			eventId: planningItem.eventId,
			title: planningItem.title,
			description: planningItem.description,
			coverageType: planningItem.coverageType,
			status: planningItem.status,
			deadline: planningItem.deadline,
			articleId: planningItem.articleId,
			createdAt: planningItem.createdAt,
			assignee: {
				id: user.id,
				name: user.name,
				image: user.image,
			},
		})
		.from(planningItem)
		.leftJoin(user, eq(planningItem.assignedTo, user.id))
		.orderBy(asc(planningItem.deadline));

	const standaloneItems = items.filter((i) => !i.eventId);
	const allUsers = await db.select({ id: user.id, name: user.name, image: user.image }).from(user);

	return {
		events: events.map((e) => ({
			...e,
			items: items.filter((i) => i.eventId === e.id),
		})),
		standaloneItems,
		allUsers,
		currentUserId: currentUser?.id ?? (allUsers[0]?.id ?? ''),
	};
};

export const actions: Actions = {
	createEvent: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}
		const createdBy = user.id;

		const data = await request.formData();
		const title = data.get('title') as string;
		const description = (data.get('description') as string) || null;
		const location = (data.get('location') as string) || null;
		const startAt = data.get('startAt') as string;
		const endAt = (data.get('endAt') as string) || null;

		if (!title || !startAt) {
			return fail(400, { message: 'Title and start date are required' });
		}

		await db.insert(planningEvent).values({
			id: nanoid(),
			title,
			description,
			location,
			startAt: new Date(startAt),
			endAt: endAt ? new Date(endAt) : null,
			createdBy,
		});

		return { success: true };
	},

	updateEventStatus: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const status = data.get('status') as string;

		if (!id || !status) return fail(400, { message: 'Missing fields' });

		await db.update(planningEvent).set({ status }).where(eq(planningEvent.id, id));
		return { success: true };
	},

	deleteEvent: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'Missing event ID' });

		await db.delete(planningEvent).where(eq(planningEvent.id, id));
		return { success: true };
	},

	createItem: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}
		const createdBy = user.id;

		const data = await request.formData();
		const eventId = (data.get('eventId') as string) || null;
		const title = data.get('title') as string;
		const description = (data.get('description') as string) || null;
		const coverageType = (data.get('coverageType') as string) || 'text';
		const assignedTo = (data.get('assignedTo') as string) || null;
		const deadline = (data.get('deadline') as string) || null;

		if (!title) {
			return fail(400, { message: 'Title is required' });
		}

		await db.insert(planningItem).values({
			id: nanoid(),
			eventId,
			title,
			description,
			coverageType,
			assignedTo,
			deadline: deadline ? new Date(deadline) : null,
			createdBy,
		});

		return { success: true };
	},

	updateItemStatus: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const status = data.get('status') as string;

		if (!id || !status) return fail(400, { message: 'Missing fields' });

		await db.update(planningItem).set({ status }).where(eq(planningItem.id, id));
		return { success: true };
	},

	deleteItem: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'Missing item ID' });

		await db.delete(planningItem).where(eq(planningItem.id, id));
		return { success: true };
	},
};
