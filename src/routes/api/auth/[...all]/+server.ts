// TEMPORARY FIX: Better Auth v1.5.0 has missing export specifiers
// Commenting out until package is fixed
// import { auth } from '$lib/server/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

// Temporary stub - returns error indicating auth is disabled
export const GET = async (event: RequestEvent) => {
	return json(
		{ error: 'Authentication temporarily disabled due to Better Auth package issue' },
		{ status: 503 }
	);
};

export const POST = async (event: RequestEvent) => {
	return json(
		{ error: 'Authentication temporarily disabled due to Better Auth package issue' },
		{ status: 503 }
	);
};
