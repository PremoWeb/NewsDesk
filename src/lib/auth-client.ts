import { createAuthClient } from 'better-auth/svelte';

const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
export default authClient;
