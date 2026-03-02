import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import { building } from '$app/environment';
// TEMPORARY FIX: Better Auth v1.5.0 has missing export specifiers
// Commenting out until package is fixed
// import { auth } from '$lib/server/auth';
// import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

// TEMPORARY FIX: Disabled until Better Auth package is fixed
const handleBetterAuth: Handle = async ({ event, resolve }) => {
	// const session = await auth.api.getSession({ headers: event.request.headers });

	// if (session) {
	// 	event.locals.session = session.session;
	// 	event.locals.user = session.user;
	// }

	// return svelteKitHandler({ event, resolve, auth, building });
	return resolve(event);
};

const handleAuth: Handle = async ({ event, resolve }) => {
	const session = event.cookies.get('nd_session');
	const pathname = event.url.pathname;

	// Protect /workspace/* routes
	if (pathname.startsWith('/workspace') && !session) {
		return redirect(302, '/');
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleBetterAuth, handleAuth);
