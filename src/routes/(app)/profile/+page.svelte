<script lang="ts">
	import PageContainer from '$lib/components/layout/PageContainer.svelte';
	import PageContent from '$lib/components/layout/PageContent.svelte';
	import Toolbar from '$lib/components/layout/Toolbar.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import * as Avatar from '$lib/components/ui/avatar';

	// TODO: Replace with real session user
	let user = $state({
		name: 'Demo User',
		email: 'demo@newsdesk.local',
	});

	let saving = $state(false);
	let saved = $state(false);

	function handleSave(e: SubmitEvent) {
		e.preventDefault();
		saving = true;
		setTimeout(() => {
			saving = false;
			saved = true;
			setTimeout(() => (saved = false), 3000);
		}, 600);
	}
</script>

<PageContainer>
	<Toolbar>
		<span class="text-sm font-medium">Profile</span>
	</Toolbar>

	<PageContent>
		<div class="mx-auto max-w-2xl py-8">
			<div class="mb-8">
				<h1 class="text-2xl font-bold tracking-tight">Your Profile</h1>
				<p class="text-muted-foreground mt-1 text-sm">Manage your personal information and preferences.</p>
			</div>

			{#if saved}
				<div class="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
					Profile saved successfully.
				</div>
			{/if}

			<!-- Avatar -->
			<section class="space-y-4">
				<div>
					<h2 class="text-base font-semibold">Avatar</h2>
				</div>
				<Separator />
				<div class="flex items-center gap-4">
					<Avatar.Root class="h-16 w-16">
						<Avatar.Fallback class="text-xl">{user.name.charAt(0)}</Avatar.Fallback>
					</Avatar.Root>
					<div>
						<Button variant="outline" size="sm" disabled>Upload Photo</Button>
						<p class="text-muted-foreground mt-1 text-xs">JPG, PNG or GIF. Max 2MB.</p>
					</div>
				</div>
			</section>

			<!-- Personal Info -->
			<section class="mt-10 space-y-4">
				<div>
					<h2 class="text-base font-semibold">Personal Information</h2>
					<p class="text-muted-foreground text-sm">Update your name and email address.</p>
				</div>
				<Separator />
				<form onsubmit={handleSave} class="space-y-4">
					<div class="space-y-2">
						<Label for="name">Full Name</Label>
						<Input id="name" name="name" value={user.name} />
					</div>
					<div class="space-y-2">
						<Label for="email">Email Address</Label>
						<Input id="email" name="email" type="email" value={user.email} />
					</div>
					<div class="flex justify-end pt-2">
						<Button type="submit" disabled={saving}>
							{saving ? 'Saving...' : 'Save Profile'}
						</Button>
					</div>
				</form>
			</section>

			<!-- Password -->
			<section class="mt-10 space-y-4">
				<div>
					<h2 class="text-base font-semibold">Change Password</h2>
					<p class="text-muted-foreground text-sm">Update your password to keep your account secure.</p>
				</div>
				<Separator />
				<form onsubmit={handleSave} class="space-y-4">
					<div class="space-y-2">
						<Label for="current-password">Current Password</Label>
						<Input id="current-password" name="current-password" type="password" placeholder="••••••••" />
					</div>
					<div class="space-y-2">
						<Label for="new-password">New Password</Label>
						<Input id="new-password" name="new-password" type="password" placeholder="••••••••" />
					</div>
					<div class="space-y-2">
						<Label for="confirm-password">Confirm New Password</Label>
						<Input id="confirm-password" name="confirm-password" type="password" placeholder="••••••••" />
					</div>
					<div class="flex justify-end pt-2">
						<Button type="submit" disabled={saving}>
							{saving ? 'Updating...' : 'Update Password'}
						</Button>
					</div>
				</form>
			</section>
		</div>
	</PageContent>
</PageContainer>
