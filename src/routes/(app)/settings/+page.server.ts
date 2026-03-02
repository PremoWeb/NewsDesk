import { db } from '$lib/server/db';
import { category, customField, desk, stage, user } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { Actions, PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ cookies, locals }) => {
	const [categories, customFields, desks] = await Promise.all([
		db
			.select({ id: category.id, name: category.name, slug: category.slug, description: category.description })
			.from(category)
			.orderBy(category.name),

		db
			.select()
			.from(customField)
			.orderBy(customField.name),

		db
			.select({ id: desk.id, name: desk.name, description: desk.description, color: desk.color, createdAt: desk.createdAt })
			.from(desk)
			.orderBy(asc(desk.name)),
	]);

	// Load stages for each desk
	const stages = await db
		.select({ id: stage.id, deskId: stage.deskId, name: stage.name, order: stage.order, color: stage.color })
		.from(stage)
		.orderBy(asc(stage.order));

	const desksWithStages = desks.map((d) => ({
		...d,
		stages: stages.filter((s) => s.deskId === d.id),
	}));

	const users = await db
		.select({ id: user.id, name: user.name, email: user.email, image: user.image, role: user.role, createdAt: user.createdAt })
		.from(user)
		.orderBy(asc(user.name));

	return { categories, customFields, desks: desksWithStages, users, currentUser: locals.user };
};

export const actions: Actions = {
	createCategory: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		const description = data.get('description')?.toString().trim() || null;

		if (!name) {
			return fail(400, { createError: 'Category name is required' });
		}

		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');

		try {
			await db.insert(category).values({ id: nanoid(), name, slug, description });
		} catch {
			return fail(400, { createError: `Category "${name}" already exists` });
		}

		return { created: true };
	},

	deleteCategory: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { deleteError: 'Category ID is required' });
		}

		await db.delete(category).where(eq(category.id, id));
		return { deleted: true };
	},

	createCustomField: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('cf_name')?.toString().trim();
		const type = data.get('cf_type')?.toString() || 'text';
		const placeholder = data.get('cf_placeholder')?.toString().trim() || null;
		const required = data.get('cf_required') === 'on';
		const optionsRaw = data.get('cf_options')?.toString().trim() || null;

		if (!name) {
			return fail(400, { cfCreateError: 'Field name is required' });
		}

		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '');

		// Parse select options
		let options: string | null = null;
		if (type === 'select' && optionsRaw) {
			const parsed = optionsRaw
				.split(',')
				.map((o) => o.trim())
				.filter(Boolean);
			options = JSON.stringify(parsed);
		}

		try {
			await db.insert(customField).values({ id: nanoid(), name, slug, type, options, required, placeholder });
		} catch {
			return fail(400, { cfCreateError: `Custom field "${name}" already exists` });
		}

		return { cfCreated: true };
	},

	deleteCustomField: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { cfDeleteError: 'Field ID is required' });
		}

		await db.delete(customField).where(eq(customField.id, id));
		return { cfDeleted: true };
	},

	createDesk: async ({ request, locals }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		const description = data.get('description')?.toString().trim() || null;
		const color = data.get('color')?.toString() || '#6366f1';

		if (!name) {
			return fail(400, { deskCreateError: 'Desk name is required' });
		}

		const fallbackUser = locals.user ?? (await db.select({ id: user.id }).from(user).limit(1))[0];
		if (!fallbackUser) return fail(401, { deskCreateError: 'Not authenticated' });

		try {
			const deskId = nanoid();
			await db.insert(desk).values({ id: deskId, name, description, color, createdBy: fallbackUser.id });
			// Create default stages for the desk
			const defaultStages = [
				{ name: 'Draft', order: 0, color: '#94a3b8' },
				{ name: 'In Progress', order: 1, color: '#3b82f6' },
				{ name: 'Review', order: 2, color: '#f59e0b' },
				{ name: 'Ready', order: 3, color: '#10b981' },
			];
			for (const s of defaultStages) {
				await db.insert(stage).values({ id: nanoid(), deskId, ...s });
			}
		} catch {
			return fail(400, { deskCreateError: `Desk "${name}" already exists` });
		}

		return { deskCreated: true };
	},

	deleteDesk: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) return fail(400, { deskDeleteError: 'Desk ID is required' });

		await db.delete(desk).where(eq(desk.id, id));
		return { deskDeleted: true };
	},

	createStage: async ({ request }) => {
		const data = await request.formData();
		const deskId = data.get('deskId')?.toString();
		const name = data.get('name')?.toString().trim();
		const color = data.get('color')?.toString() || '#94a3b8';

		if (!deskId || !name) return fail(400, { stageCreateError: 'Desk and stage name are required' });

		await db.insert(stage).values({ id: nanoid(), deskId, name, color, order: 99 });
		return { stageCreated: true };
	},

	deleteStage: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) return fail(400, { stageDeleteError: 'Stage ID is required' });

		await db.delete(stage).where(eq(stage.id, id));
		return { stageDeleted: true };
	},

	updateUserRole: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { roleError: 'Only admins can change user roles' });
		}

		const data = await request.formData();
		const userId = data.get('userId')?.toString();
		const role = data.get('role')?.toString();

		if (!userId || !role) return fail(400, { roleError: 'User ID and role are required' });

		const validRoles = ['admin', 'editor', 'journalist', 'viewer'];
		if (!validRoles.includes(role)) return fail(400, { roleError: 'Invalid role' });

		await db.update(user).set({ role }).where(eq(user.id, userId));
		return { roleUpdated: true };
	},
};
