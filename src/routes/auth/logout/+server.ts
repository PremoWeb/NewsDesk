import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth';

export const GET: RequestHandler = async ({ request }) => {
	await auth.api.signOut({ headers: request.headers });
	redirect(302, '/');
};
