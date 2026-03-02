<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { tray } from '$lib/stores/tray.svelte';
	import PageContainer from '$lib/components/layout/PageContainer.svelte';
	import PageContent from '$lib/components/layout/PageContent.svelte';
	import Toolbar from '$lib/components/layout/Toolbar.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import RichTextEditor from '$lib/components/editor/RichTextEditor.svelte';
	import TagInput from '$lib/components/ui/tag-input/TagInput.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
	let deleting = $state(false);
	let showDeleteConfirm = $state(false);
	let liveWordCount = $state<number | null>(null);
	let liveReadTime = $derived(
		liveWordCount !== null && liveWordCount > 0
			? Math.max(1, Math.ceil(liveWordCount / 200))
			: null
	);
	let tags = $state<string[]>([]);
	$effect(() => { tags = data.tags ?? []; });
	let selectedCategories = $state<string[]>([]);
	$effect(() => { selectedCategories = data.articleCategories ?? []; });

	// Register in bottom bar tray
	$effect(() => {
		tray.addItem(data.article.id, data.article.headline ?? 'Untitled');
	});
	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let autoSaveTimer: ReturnType<typeof setTimeout> | undefined;
	let formEl: HTMLFormElement;

	function scheduleAutoSave() {
		clearTimeout(autoSaveTimer);
		autoSaveTimer = setTimeout(() => {
			saveStatus = 'saving';
			formEl?.requestSubmit();
		}, 2000);
	}

	const art = $derived(data.article);

	const statusOptions = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'working', label: 'In Progress' },
		{ value: 'submitted', label: 'Submitted' },
		{ value: 'published', label: 'Published' },
		{ value: 'archived', label: 'Archived' },
	];

	const priorityOptions = [
		{ value: 'low', label: 'Low' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' },
		{ value: 'urgent', label: 'Urgent' },
	];

	const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
		draft: 'outline',
		working: 'secondary',
		submitted: 'default',
		published: 'default',
		archived: 'secondary',
	};

	function formatDate(d: Date | string | null) {
		if (!d) return '—';
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
		}).format(new Date(d));
	}
</script>

<PageContainer>
	<PageContent shrink>
		<Toolbar>
			<div class="flex min-w-0 flex-1 items-center gap-3">
			<a href="/workspace/authoring" class="text-muted-foreground hover:text-foreground shrink-0 text-sm">
				← Articles
			</a>
			<span class="text-muted-foreground">/</span>
			<span class="min-w-0 truncate text-sm font-medium">{art.headline}</span>
			<Badge variant={statusVariant[art.status] ?? 'outline'} class="shrink-0 capitalize">
				{art.status}
			</Badge>
		</div>

		<div class="flex shrink-0 items-center gap-2">
			{#if art.wordCount || liveWordCount}
				<span class="text-muted-foreground text-xs">{liveWordCount ?? art.wordCount} words</span>
				<span class="text-muted-foreground text-xs">·</span>
				<span class="text-muted-foreground text-xs">{liveReadTime ?? (art.readTime || Math.max(1, Math.ceil((art.wordCount ?? 0) / 200)))} min read</span>
			{/if}

			{#if saveStatus === 'saving'}
				<span class="text-muted-foreground text-xs">Saving...</span>
			{:else if saveStatus === 'saved'}
				<span class="text-xs text-green-500">Saved ✓</span>
			{:else if saveStatus === 'error'}
				<span class="text-xs text-red-500">Save failed</span>
			{/if}

			{#if !showDeleteConfirm}
				<Button
					variant="outline"
					size="sm"
					class="text-destructive hover:text-destructive"
					onclick={() => (showDeleteConfirm = true)}
				>
					Delete
				</Button>
			{:else}
				<span class="text-muted-foreground text-xs">Are you sure?</span>
				<form method="POST" action="?/delete" use:enhance={() => {
					deleting = true;
					return async ({ update }) => { deleting = false; await update(); };
				}}>
					<Button variant="destructive" size="sm" type="submit" disabled={deleting}>
						{deleting ? 'Deleting...' : 'Yes, Delete'}
					</Button>
				</form>
				<Button variant="ghost" size="sm" onclick={() => (showDeleteConfirm = false)}>
					Cancel
				</Button>
			{/if}
			</div>
		</Toolbar>

		<div class="flex-1 overflow-y-auto">
		<div class="mx-auto max-w-3xl py-8">
			<!-- Meta info -->
			<div class="text-muted-foreground mb-6 flex flex-wrap gap-4 text-xs">
				<span>Created {formatDate(art.createdAt)}</span>
				<span>Updated {formatDate(art.updatedAt)}</span>
				{#if art.publishedAt}
					<span>Published {formatDate(art.publishedAt)}</span>
				{/if}
			</div>

			<form
				bind:this={formEl}
				method="POST"
				action="?/update"
				oninput={scheduleAutoSave}
				use:enhance={() => {
					submitting = true;
					return async ({ result, update }) => {
						submitting = false;
						if (result.type === 'failure' || result.type === 'error') {
							saveStatus = 'error';
							const msg = result.type === 'failure' ? (result.data as { error?: string })?.error : 'An unexpected error occurred';
							toast.error(msg ?? 'Failed to save article');
						} else {
							saveStatus = 'saved';
							setTimeout(() => { if (saveStatus === 'saved') saveStatus = 'idle'; }, 3000);
						}
						await update({ reset: false });
					};
				}}
				class="space-y-6"
			>
				<!-- Headline -->
				<div class="space-y-2">
					<Label for="headline">Headline <span class="text-destructive">*</span></Label>
					<Input
						id="headline"
						name="headline"
						type="text"
						placeholder="Enter article headline..."
						value={art.headline}
						required
						class="text-base"
					/>
				</div>

				<!-- Byline -->
				<div class="space-y-2">
					<Label for="byline">Byline</Label>
					<Input
						id="byline"
						name="byline"
						type="text"
						placeholder="e.g. By Jane Smith and John Doe"
						value={art.byline ?? ''}
					/>
					<p class="text-muted-foreground text-xs">Display credit line shown with the article.</p>
				</div>

				<!-- Excerpt -->
				<div class="space-y-2">
					<Label for="excerpt">Excerpt</Label>
					<Textarea
						id="excerpt"
						name="excerpt"
						placeholder="Brief summary of the article..."
						rows={3}
						value={art.excerpt ?? ''}
					/>
				</div>

				<!-- Body -->
				<div class="space-y-2">
					<Label for="body">Body</Label>
					<RichTextEditor
						name="body"
						content={art.body ?? ''}
						placeholder="Write your article content here..."
						onWordCount={(count) => { liveWordCount = count; scheduleAutoSave(); }}
					/>
				</div>

				<!-- Row: Status + Priority + Author -->
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<!-- Status -->
					<div class="space-y-2">
						<Label for="status">Status</Label>
						<select
							id="status"
							name="status"
							class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#each statusOptions as opt (opt.value)}
								<option value={opt.value} selected={opt.value === art.status}>
									{opt.label}
								</option>
							{/each}
						</select>
					</div>

					<!-- Priority -->
					<div class="space-y-2">
						<Label for="priority">Priority</Label>
						<select
							id="priority"
							name="priority"
							class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#each priorityOptions as opt (opt.value)}
								<option value={opt.value} selected={opt.value === art.priority}>
									{opt.label}
								</option>
							{/each}
						</select>
					</div>

					<!-- Author -->
					<div class="space-y-2">
						<Label for="authorId">Author <span class="text-destructive">*</span></Label>
						<select
							id="authorId"
							name="authorId"
							required
							class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#each data.authors as author (author.id)}
								<option value={author.id} selected={author.id === art.authorId}>
									{author.name}
								</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Tags -->
				<div class="space-y-2">
					<Label>Tags</Label>
					<TagInput bind:tags name="tags" placeholder="Add tag and press Enter..." />
					<p class="text-muted-foreground text-xs">Press Enter or comma to add a tag.</p>
				</div>

				<!-- Categories -->
				{#if data.categories.length > 0}
					<div class="space-y-2">
						<Label>Categories</Label>
						<div class="border-input rounded-md border p-3">
							<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
								{#each data.categories as cat (cat.id)}
									<label class="flex cursor-pointer items-center gap-2 text-sm">
										<input
											type="checkbox"
											name="categories[]"
											value={cat.id}
											checked={selectedCategories.includes(cat.id)}
											onchange={(e) => {
												if (e.currentTarget.checked) {
													selectedCategories = [...selectedCategories, cat.id];
												} else {
													selectedCategories = selectedCategories.filter((id) => id !== cat.id);
												}
											}}
											class="h-4 w-4 rounded border"
										/>
										{cat.name}
									</label>
								{/each}
							</div>
						</div>
					</div>
				{/if}

				<!-- Custom Fields -->
				{#if data.customFields.length > 0}
					<div class="space-y-4">
						<div class="border-t pt-2">
							<p class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Custom Fields</p>
						</div>
						{#each data.customFields as field (field.id)}
							<div class="space-y-2">
								<Label for="cf-{field.id}">
									{field.name}
									{#if field.required}<span class="text-destructive">*</span>{/if}
								</Label>
								{#if field.type === 'boolean'}
									<div class="flex items-center gap-2">
										<input
											id="cf-{field.id}"
											name="cf_{field.id}"
											type="checkbox"
											checked={data.customFieldValues[field.id] === 'true'}
											class="h-4 w-4 rounded border"
										/>
										<label for="cf-{field.id}" class="text-sm font-normal cursor-pointer">Yes</label>
									</div>
								{:else if field.type === 'select' && field.options}
									<select
										id="cf-{field.id}"
										name="cf_{field.id}"
										required={field.required}
										class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
									>
										<option value="">— Select —</option>
										{#each JSON.parse(field.options) as opt (opt)}
											<option value={opt} selected={data.customFieldValues[field.id] === opt}>{opt}</option>
										{/each}
									</select>
								{:else if field.type === 'number'}
									<Input
										id="cf-{field.id}"
										name="cf_{field.id}"
										type="number"
										placeholder={field.placeholder ?? ''}
										value={data.customFieldValues[field.id] ?? ''}
										required={field.required}
									/>
								{:else if field.type === 'date'}
									<Input
										id="cf-{field.id}"
										name="cf_{field.id}"
										type="date"
										value={data.customFieldValues[field.id] ?? ''}
										required={field.required}
									/>
								{:else}
									<Input
										id="cf-{field.id}"
										name="cf_{field.id}"
										type="text"
										placeholder={field.placeholder ?? ''}
										value={data.customFieldValues[field.id] ?? ''}
										required={field.required}
									/>
								{/if}
							</div>
						{/each}
					</div>
				{/if}

				<!-- Featured -->
				<div class="flex items-center gap-2">
					<input
						id="featured"
						name="featured"
						type="checkbox"
						checked={art.featured}
						class="h-4 w-4 rounded border"
					/>
					<Label for="featured" class="cursor-pointer font-normal">Mark as featured article</Label>
				</div>

				<!-- Actions -->
				<div class="flex items-center justify-end gap-3 border-t pt-6">
					<Button variant="outline" href="/workspace/authoring" type="button">
						Discard Changes
					</Button>
					<Button type="submit" disabled={submitting}>
						{submitting ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>
			</form>
		</div>
		</div>
	</PageContent>
</PageContainer>
