import { db } from '$lib/server/db';
import { mediaAsset, user } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { PageServerLoad, Actions } from './$types';


export const load: PageServerLoad = async ({ locals }) => {
	const currentUser = locals.user;
	const assets = await db
		.select({
			id: mediaAsset.id,
			filename: mediaAsset.filename,
			originalName: mediaAsset.originalName,
			mimeType: mediaAsset.mimeType,
			size: mediaAsset.size,
			url: mediaAsset.url,
			caption: mediaAsset.caption,
			altText: mediaAsset.altText,
			credit: mediaAsset.credit,
			width: mediaAsset.width,
			height: mediaAsset.height,
			createdAt: mediaAsset.createdAt,
			uploader: {
				id: user.id,
				name: user.name,
				image: user.image,
			},
		})
		.from(mediaAsset)
		.leftJoin(user, eq(mediaAsset.uploadedBy, user.id))
		.orderBy(desc(mediaAsset.createdAt));

	const allUsers = await db.select({ id: user.id, name: user.name }).from(user);
	return {
		assets,
		currentUserId: currentUser?.id ?? (allUsers[0]?.id ?? ''),
	};
};

export const actions: Actions = {
	upload: async ({ request, locals }) => {
		// Fall back to first user in DB during dev if session not found
		const fallbackUser = locals.user ?? (await db.select({ id: user.id }).from(user).limit(1))[0];
		if (!fallbackUser) {
			return fail(401, { message: 'Not authenticated' });
		}
		const uploadedBy = fallbackUser.id;

		const data = await request.formData();
		const file = data.get('file') as File | null;
		const caption = (data.get('caption') as string) || null;
		const altText = (data.get('altText') as string) || null;
		const credit = (data.get('credit') as string) || null;

		if (!file || file.size === 0) {
			return fail(400, { message: 'No file provided' });
		}

		const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf'];
		if (!allowed.includes(file.type)) {
			return fail(400, { message: 'File type not allowed' });
		}

		const ext = file.name.split('.').pop() ?? 'bin';
		const filename = `${nanoid()}.${ext}`;
		const uploadsDir = join(process.cwd(), 'static', 'uploads');

		await mkdir(uploadsDir, { recursive: true });
		const buffer = Buffer.from(await file.arrayBuffer());
		await writeFile(join(uploadsDir, filename), buffer);

		await db.insert(mediaAsset).values({
			id: nanoid(),
			filename,
			originalName: file.name,
			mimeType: file.type,
			size: file.size,
			url: `/uploads/${filename}`,
			caption,
			altText,
			credit,
			uploadedBy,
		});

		return { success: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'Missing asset ID' });

		await db.delete(mediaAsset).where(eq(mediaAsset.id, id));
		return { success: true };
	},

	updateMeta: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const caption = (data.get('caption') as string) || null;
		const altText = (data.get('altText') as string) || null;
		const credit = (data.get('credit') as string) || null;

		if (!id) return fail(400, { message: 'Missing asset ID' });

		await db.update(mediaAsset).set({ caption, altText, credit }).where(eq(mediaAsset.id, id));
		return { success: true };
	},
};
