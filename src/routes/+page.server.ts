import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
	const session = cookies.get('nd_session');
	if (session) {
		redirect(302, '/workspace/monitoring');
	}
};

export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString().trim();
		const password = data.get('password')?.toString();

		if (!username || !password) {
			return { error: 'Please enter your username and password.' };
		}

		// Stub: accept any credentials during development
		// TODO: Replace with real auth once Better Auth is fixed
		cookies.set('nd_session', username, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});
		redirect(302, '/workspace/monitoring');
	}
} satisfies Actions;
