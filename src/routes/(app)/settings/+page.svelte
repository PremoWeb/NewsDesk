<script lang="ts">
	import { enhance } from '$app/forms';
	import PageContainer from '$lib/components/layout/PageContainer.svelte';
	import PageContent from '$lib/components/layout/PageContent.svelte';
	import Toolbar from '$lib/components/layout/Toolbar.svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Trash2 } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let saving = $state(false);
	let creatingCategory = $state(false);
	let newCategoryName = $state('');
	let newCategoryDescription = $state('');

	let creatingCustomField = $state(false);
	let cfName = $state('');
	let cfType = $state('text');
	let cfOptions = $state('');
	let cfPlaceholder = $state('');
	let cfRequired = $state(false);

	function handleSave(e: SubmitEvent) {
		e.preventDefault();
		saving = true;
		setTimeout(() => {
			saving = false;
			toast.success('Settings saved successfully.');
		}, 600);
	}
</script>

<PageContainer>
	<Toolbar>
		<span class="text-sm font-medium">Settings</span>
	</Toolbar>

	<PageContent>
		<div class="mx-auto max-w-2xl py-8">
			<div class="mb-8">
				<h1 class="text-2xl font-bold tracking-tight">Settings</h1>
				<p class="text-muted-foreground mt-1 text-sm">Manage your workspace and account preferences.</p>
			</div>

			<!-- Appearance -->
			<section class="space-y-4">
				<div>
					<h2 class="text-base font-semibold">Appearance</h2>
					<p class="text-muted-foreground text-sm">Customize how NewsDesk looks.</p>
				</div>
				<Separator />
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium">Theme</p>
							<p class="text-muted-foreground text-xs">Light, dark, or system default</p>
						</div>
						<select
							class="border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
						>
							<option value="system">System</option>
							<option value="light">Light</option>
							<option value="dark">Dark</option>
						</select>
					</div>
				</div>
			</section>

			<!-- Newsroom -->
			<section class="mt-10 space-y-4">
				<div>
					<h2 class="text-base font-semibold">Newsroom</h2>
					<p class="text-muted-foreground text-sm">General newsroom configuration.</p>
				</div>
				<Separator />
				<form onsubmit={handleSave} class="space-y-4">
					<div class="space-y-2">
						<Label for="org-name">Organization Name</Label>
						<Input id="org-name" name="org-name" placeholder="My News Organization" value="NewsDesk" />
					</div>
					<div class="space-y-2">
						<Label for="site-url">Site URL</Label>
						<Input id="site-url" name="site-url" type="url" placeholder="https://example.com" />
					</div>
					<div class="space-y-2">
						<Label for="timezone">Default Timezone</Label>
						<select
							id="timezone"
							name="timezone"
							class="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
						>
							<option value="UTC">UTC</option>
							<option value="America/New_York">America/New_York</option>
							<option value="America/Los_Angeles">America/Los_Angeles</option>
							<option value="Europe/London">Europe/London</option>
							<option value="Europe/Paris">Europe/Paris</option>
							<option value="Asia/Tokyo">Asia/Tokyo</option>
						</select>
					</div>
					<div class="flex justify-end pt-2">
						<Button type="submit" disabled={saving}>
							{saving ? 'Saving...' : 'Save Settings'}
						</Button>
					</div>
				</form>
			</section>

			<!-- Notifications -->
			<section class="mt-10 space-y-4">
				<div>
					<h2 class="text-base font-semibold">Notifications</h2>
					<p class="text-muted-foreground text-sm">Configure when you receive alerts.</p>
				</div>
				<Separator />
				<div class="space-y-3">
					{#each [
						{ id: 'notif-submit', label: 'Article submitted for review', description: 'When a writer submits an article' },
						{ id: 'notif-publish', label: 'Article published', description: 'When an article goes live' },
						{ id: 'notif-assign', label: 'Article assigned to me', description: 'When an article is assigned to you' },
					] as pref (pref.id)}
						<div class="flex items-center justify-between py-1">
							<div>
								<p class="text-sm font-medium">{pref.label}</p>
								<p class="text-muted-foreground text-xs">{pref.description}</p>
							</div>
							<input type="checkbox" checked class="h-4 w-4 rounded border" />
						</div>
					{/each}
				</div>
			</section>

			<!-- Categories -->
			<section class="mt-10 space-y-4">
				<div>
					<h2 class="text-base font-semibold">Content Categories</h2>
					<p class="text-muted-foreground text-sm">Manage the article categories available across the newsroom.</p>
				</div>
				<Separator />

				<!-- Existing categories -->
				{#if data.categories.length > 0}
					<div class="space-y-2">
						{#each data.categories as cat (cat.id)}
							<div class="flex items-center justify-between rounded-md border px-3 py-2">
								<div>
									<p class="text-sm font-medium">{cat.name}</p>
									{#if cat.description}
										<p class="text-muted-foreground text-xs">{cat.description}</p>
									{/if}
								</div>
								<form method="POST" action="?/deleteCategory" use:enhance={() => {
									return async ({ result, update }) => {
										if (result.type === 'success') toast.success('Category deleted.');
										else toast.error('Failed to delete category.');
										await update();
									};
								}}>
									<input type="hidden" name="id" value={cat.id} />
									<Button variant="ghost" size="icon" type="submit" class="text-muted-foreground hover:text-destructive h-8 w-8">
										<Trash2 class="h-4 w-4" />
									</Button>
								</form>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-muted-foreground text-sm">No categories yet. Add one below.</p>
				{/if}

				<!-- Create new category -->
				<form method="POST" action="?/createCategory" use:enhance={() => {
					creatingCategory = true;
					return async ({ result, update }) => {
						creatingCategory = false;
						if (result.type === 'success') {
							toast.success('Category created successfully.');
							newCategoryName = '';
							newCategoryDescription = '';
						} else if (result.type === 'failure') {
							const msg = (result.data as { createError?: string })?.createError;
							toast.error(msg ?? 'Failed to create category.');
						}
						await update();
					};
				}} class="rounded-md border p-4 space-y-3">
					<h3 class="text-sm font-semibold">Add Category</h3>
					<div class="space-y-2">
						<Label for="cat-name">Name <span class="text-destructive">*</span></Label>
						<Input
							id="cat-name"
							name="name"
							placeholder="e.g. Sports"
							bind:value={newCategoryName}
							required
						/>
					</div>
					<div class="space-y-2">
						<Label for="cat-description">Description</Label>
						<Input
							id="cat-description"
							name="description"
							placeholder="Brief description (optional)"
							bind:value={newCategoryDescription}
						/>
					</div>
					<Button type="submit" size="sm" disabled={creatingCategory || !newCategoryName.trim()}>
						{creatingCategory ? 'Adding...' : 'Add Category'}
					</Button>
				</form>
			</section>

			<!-- Custom Fields -->
			<section class="mt-10 space-y-4">
				<div>
					<h2 class="text-base font-semibold">Custom Fields</h2>
					<p class="text-muted-foreground text-sm">Define extra metadata fields that appear in the article editor.</p>
				</div>
				<Separator />

				<!-- Existing custom fields -->
				{#if data.customFields.length > 0}
					<div class="space-y-2">
						{#each data.customFields as field (field.id)}
							<div class="flex items-center justify-between rounded-md border px-3 py-2">
								<div>
									<div class="flex items-center gap-2">
										<p class="text-sm font-medium">{field.name}</p>
										<span class="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs font-mono capitalize">{field.type}</span>
										{#if field.required}
											<span class="text-destructive text-xs">required</span>
										{/if}
									</div>
									{#if field.placeholder}
										<p class="text-muted-foreground text-xs">{field.placeholder}</p>
									{/if}
									{#if field.type === 'select' && field.options}
										<p class="text-muted-foreground text-xs">Options: {JSON.parse(field.options).join(', ')}</p>
									{/if}
								</div>
								<form method="POST" action="?/deleteCustomField" use:enhance={() => {
									return async ({ result, update }) => {
										if (result.type === 'success') toast.success('Custom field deleted.');
										else toast.error('Failed to delete custom field.');
										await update();
									};
								}}>
									<input type="hidden" name="id" value={field.id} />
									<Button variant="ghost" size="icon" type="submit" class="text-muted-foreground hover:text-destructive h-8 w-8">
										<Trash2 class="h-4 w-4" />
									</Button>
								</form>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-muted-foreground text-sm">No custom fields yet. Add one below.</p>
				{/if}

				<!-- Create new custom field -->
				<form method="POST" action="?/createCustomField" use:enhance={() => {
					creatingCustomField = true;
					return async ({ result, update }) => {
						creatingCustomField = false;
						if (result.type === 'success') {
							toast.success('Custom field created.');
							cfName = '';
							cfType = 'text';
							cfOptions = '';
							cfPlaceholder = '';
							cfRequired = false;
						} else if (result.type === 'failure') {
							const msg = (result.data as { cfCreateError?: string })?.cfCreateError;
							toast.error(msg ?? 'Failed to create custom field.');
						}
						await update();
					};
				}} class="rounded-md border p-4 space-y-3">
					<h3 class="text-sm font-semibold">Add Custom Field</h3>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="cf-name">Field Name <span class="text-destructive">*</span></Label>
							<Input
								id="cf-name"
								name="cf_name"
								placeholder="e.g. Print Edition"
								bind:value={cfName}
								required
							/>
						</div>
						<div class="space-y-2">
							<Label for="cf-type">Type</Label>
							<select
								id="cf-type"
								name="cf_type"
								bind:value={cfType}
								class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
							>
								<option value="text">Text</option>
								<option value="number">Number</option>
								<option value="boolean">Checkbox (Yes/No)</option>
								<option value="date">Date</option>
								<option value="select">Select (dropdown)</option>
							</select>
						</div>
					</div>
					{#if cfType === 'select'}
						<div class="space-y-2">
							<Label for="cf-options">Options <span class="text-muted-foreground font-normal">(comma-separated)</span></Label>
							<Input
								id="cf-options"
								name="cf_options"
								placeholder="e.g. Option A, Option B, Option C"
								bind:value={cfOptions}
							/>
						</div>
					{/if}
					{#if cfType !== 'boolean'}
						<div class="space-y-2">
							<Label for="cf-placeholder">Placeholder</Label>
							<Input
								id="cf-placeholder"
								name="cf_placeholder"
								placeholder="Hint shown inside the field"
								bind:value={cfPlaceholder}
							/>
						</div>
					{/if}
					<div class="flex items-center gap-2">
						<input
							id="cf-required"
							name="cf_required"
							type="checkbox"
							bind:checked={cfRequired}
							class="h-4 w-4 rounded border"
						/>
						<Label for="cf-required" class="cursor-pointer font-normal">Required field</Label>
					</div>
					<Button type="submit" size="sm" disabled={creatingCustomField || !cfName.trim()}>
						{creatingCustomField ? 'Adding...' : 'Add Custom Field'}
					</Button>
				</form>
			</section>

			<!-- Danger Zone -->
			<section class="mt-10 space-y-4">
				<div>
					<h2 class="text-base font-semibold text-red-600">Danger Zone</h2>
					<p class="text-muted-foreground text-sm">Irreversible account actions.</p>
				</div>
				<Separator />
				<div class="rounded-md border border-red-200 p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium">Delete Account</p>
							<p class="text-muted-foreground text-xs">Permanently remove your account and all data.</p>
						</div>
						<Button variant="destructive" size="sm" disabled>Delete Account</Button>
					</div>
				</div>
			</section>
		</div>
	</PageContent>
</PageContainer>
