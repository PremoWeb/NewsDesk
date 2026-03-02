import { db } from '$lib/server/db';
import { category, customField } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const categories = await db
		.select({ id: category.id, name: category.name, slug: category.slug, description: category.description })
		.from(category)
		.orderBy(category.name);

	const customFields = await db
		.select()
		.from(customField)
		.orderBy(customField.name);

	return { categories, customFields };
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
};
