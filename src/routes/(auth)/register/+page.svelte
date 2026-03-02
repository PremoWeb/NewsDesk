<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Card from '$lib/components/ui/card';
	import { signUp } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		// Validation
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters';
			return;
		}

		loading = true;

		try {
			const result = await signUp.email({
				name,
				email,
				password,
			});

			if (result.error) {
				error = result.error.message || 'Failed to create account';
			} else {
				goto('/workspace/monitoring');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="space-y-1">
			<Card.Title class="text-2xl font-bold text-center">Create an account</Card.Title>
			<Card.Description class="text-center">
				Get started with NewsDesk today
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleSubmit} class="space-y-4">
				{#if error}
					<div class="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
						{error}
					</div>
				{/if}

				<div class="space-y-2">
					<label for="name" class="text-sm font-medium">Full Name</label>
					<Input
						id="name"
						type="text"
						placeholder="John Doe"
						bind:value={name}
						required
						disabled={loading}
					/>
				</div>

				<div class="space-y-2">
					<label for="email" class="text-sm font-medium">Email</label>
					<Input
						id="email"
						type="email"
						placeholder="you@example.com"
						bind:value={email}
						required
						disabled={loading}
					/>
				</div>

				<div class="space-y-2">
					<label for="password" class="text-sm font-medium">Password</label>
					<Input
						id="password"
						type="password"
						placeholder="••••••••"
						bind:value={password}
						required
						disabled={loading}
					/>
				</div>

				<div class="space-y-2">
					<label for="confirmPassword" class="text-sm font-medium">Confirm Password</label>
					<Input
						id="confirmPassword"
						type="password"
						placeholder="••••••••"
						bind:value={confirmPassword}
						required
						disabled={loading}
					/>
				</div>

				<Button type="submit" class="w-full" disabled={loading}>
					{loading ? 'Creating account...' : 'Create account'}
				</Button>
			</form>
		</Card.Content>
		<Card.Footer class="flex flex-col space-y-2">
			<div class="text-sm text-center text-gray-600">
				Already have an account?
				<a href="/auth/login" class="text-blue-600 hover:underline">Sign in</a>
			</div>
		</Card.Footer>
	</Card.Root>
</div>
