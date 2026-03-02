import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

export const GET = async (event) => {
	return svelteKitHandler({ event, resolve: () => new Response(), auth, building });
};

export const POST = async (event) => {
	return svelteKitHandler({ event, resolve: () => new Response(), auth, building });
};
