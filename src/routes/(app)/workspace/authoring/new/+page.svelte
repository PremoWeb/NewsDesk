<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import PageContainer from '$lib/components/layout/PageContainer.svelte';
	import PageContent from '$lib/components/layout/PageContent.svelte';
	import Toolbar from '$lib/components/layout/Toolbar.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import RichTextEditor from '$lib/components/editor/RichTextEditor.svelte';
	import TagInput from '$lib/components/ui/tag-input/TagInput.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
	let tags = $state<string[]>([]);
	let selectedCategories = $state<string[]>([]);

	const statusOptions = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'working', label: 'In Progress' },
	];

	const priorityOptions = [
		{ value: 'low', label: 'Low' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' },
		{ value: 'urgent', label: 'Urgent' },
	];
</script>

<PageContainer>
	<PageContent shrink>
		<Toolbar>
			<div class="flex items-center gap-3">
			<a href="/workspace/authoring" class="text-muted-foreground hover:text-foreground text-sm">
				← Back to Articles
			</a>
			<span class="text-muted-foreground">/</span>
			<span class="text-sm font-medium">New Article</span>
			</div>
		</Toolbar>

		<div class="flex-1 overflow-y-auto">
		<div class="mx-auto max-w-3xl py-8">
			<div class="mb-8">
				<h1 class="text-2xl font-bold tracking-tight">Create New Article</h1>
				<p class="text-muted-foreground mt-1 text-sm">
					Fill in the details below to create a new article.
				</p>
			</div>

			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					submitting = true;
					return async ({ result, update }) => {
						submitting = false;
						if (result.type === 'failure') {
							const msg = (result.data as { error?: string })?.error;
							toast.error(msg ?? 'Failed to create article');
						}
						await update();
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
						value={form?.headline ?? ''}
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
						value={form?.byline ?? ''}
					/>
					<p class="text-muted-foreground text-xs">Display credit line shown with the article.</p>
				</div>

				<!-- Excerpt -->
				<div class="space-y-2">
					<Label for="excerpt">Excerpt</Label>
					<Textarea
						id="excerpt"
						name="excerpt"
						placeholder="Brief summary of the article (used in previews and listings)..."
						rows={3}
						value={form?.excerpt ?? ''}
					/>
				</div>

				<!-- Body -->
				<div class="space-y-2">
					<Label for="body">Body</Label>
					<RichTextEditor
						name="body"
						content={form?.body ?? ''}
						placeholder="Write your article content here..."
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
							class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#each statusOptions as opt (opt.value)}
								<option
									value={opt.value}
									selected={opt.value === (form?.status ?? 'draft')}
								>
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
							class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#each priorityOptions as opt (opt.value)}
								<option
									value={opt.value}
									selected={opt.value === (form?.priority ?? 'medium')}
								>
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
							class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">Select an author...</option>
							{#each data.authors as author (author.id)}
								<option
									value={author.id}
									selected={author.id === form?.authorId}
								>
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

				<!-- Actions -->
				<div class="flex items-center justify-end gap-3 border-t pt-6">
					<Button variant="outline" href="/workspace/authoring" type="button">
						Cancel
					</Button>
					<Button type="submit" disabled={submitting}>
						{submitting ? 'Creating...' : 'Create Article'}
					</Button>
				</div>
			</form>
		</div>
		</div>
	</PageContent>
</PageContainer>
