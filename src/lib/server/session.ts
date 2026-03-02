import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { like } from 'drizzle-orm';

export type SessionUser = {
	id: string;
	name: string;
	email: string;
	image: string | null;
	role: string;
};

/**
 * Resolves the current user from the nd_session cookie.
 * This is the canonical session helper — import from here instead of
 * duplicating the lookup logic in each +page.server.ts.
 */
export async function getSessionUser(
	cookies: { get: (name: string) => string | undefined }
): Promise<SessionUser | null> {
	const sessionName = cookies.get('nd_session');
	if (!sessionName) return null;

	const [found] = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			role: user.role
		})
		.from(user)
		.where(like(user.name, sessionName))
		.limit(1);

	return found ?? null;
}
