<script lang="ts">
	import { goto } from '$app/navigation';
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import PageContainer from '$lib/components/layout/PageContainer.svelte';
	import PageContent from '$lib/components/layout/PageContent.svelte';
	import Toolbar from '$lib/components/layout/Toolbar.svelte';
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchValue = $state(untrack(() => data.filters.search ?? ''));

	const statusTabs = [
		{ value: 'all', label: 'All' },
		{ value: 'draft', label: 'Draft' },
		{ value: 'working', label: 'In Progress' },
		{ value: 'submitted', label: 'Submitted' },
		{ value: 'published', label: 'Published' },
		{ value: 'archived', label: 'Archived' },
	];

	const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
		draft: 'outline',
		working: 'secondary',
		submitted: 'default',
		published: 'default',
		archived: 'outline',
	};

	const statusLabel: Record<string, string> = {
		draft: 'Draft',
		working: 'In Progress',
		submitted: 'Submitted',
		published: 'Published',
		archived: 'Archived',
	};

	const priorityLabel: Record<string, string> = {
		low: 'Low',
		medium: 'Medium',
		high: 'High',
		urgent: 'Urgent',
	};

	function formatDate(date: Date | string | null) {
		if (!date) return '—';
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	}

	function handleTabChange(value: string) {
		const params = new URLSearchParams(page.url.searchParams);
		if (value === 'all') {
			params.delete('status');
		} else {
			params.set('status', value);
		}
		goto(`?${params}`);
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		const params = new URLSearchParams(page.url.searchParams);
		if (searchValue) {
			params.set('q', searchValue);
		} else {
			params.delete('q');
		}
		goto(`?${params}`);
	}

	function clearSearch() {
		searchValue = '';
		const params = new URLSearchParams(page.url.searchParams);
		params.delete('q');
		goto(`?${params}`);
	}

	const currentTab = $derived(data.filters.status || 'all');
</script>

<PageContainer>
	<PageContent shrink>
		<Toolbar>
			<h1 class="text-lg font-semibold">Articles</h1>

			<div class="toolbar-search">
				<form onsubmit={handleSearch} class="flex items-center gap-2">
					<Input
						type="search"
						placeholder="Search articles..."
						class="w-64"
						bind:value={searchValue}
					/>
					{#if data.filters.search}
						<Button type="button" variant="ghost" size="sm" onclick={clearSearch}>
							Clear
						</Button>
					{/if}
				</form>
			</div>

			<div class="toolbar-actions">
				<Button href="/workspace/authoring/new" size="sm">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
						<path d="M12 5v14M5 12h14"/>
					</svg>
					New Article
				</Button>
			</div>
		</Toolbar>

		<div class="authoring-content">
			<div class="authoring-filters">
				<Tabs.Root value={currentTab} onValueChange={handleTabChange}>
					<Tabs.List>
						{#each statusTabs as tab}
							<Tabs.Trigger value={tab.value}>{tab.label}</Tabs.Trigger>
						{/each}
					</Tabs.List>
				</Tabs.Root>
			</div>

			{#if data.articles.length === 0}
				<div class="empty-state">
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
						<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
						<polyline points="14 2 14 8 20 8"/>
						<line x1="16" y1="13" x2="8" y2="13"/>
						<line x1="16" y1="17" x2="8" y2="17"/>
						<line x1="10" y1="9" x2="8" y2="9"/>
					</svg>
					<p class="empty-title">No articles found</p>
					<p class="empty-description">
						{#if data.filters.search}
							No articles match your search.
							<button class="text-link" onclick={clearSearch}>Clear search</button>
						{:else if data.filters.status && data.filters.status !== 'all'}
							No {statusLabel[data.filters.status] || data.filters.status} articles yet.
						{:else}
							Create your first article to get started.
						{/if}
					</p>
					{#if !data.filters.search}
						<Button href="/workspace/authoring/new" size="sm" class="mt-4">New Article</Button>
					{/if}
				</div>
			{:else}
				<div class="articles-table">
					<div class="articles-table-header">
						<span class="col-headline">Headline</span>
						<span class="col-status">Status</span>
						<span class="col-priority">Priority</span>
						<span class="col-author">Author</span>
						<span class="col-updated">Updated</span>
					</div>
					<div class="articles-list">
						{#each data.articles as art}
							<a href="/workspace/authoring/{art.id}" class="article-row">
								<div class="col-headline">
									<p class="article-headline">{art.headline}</p>
									{#if art.excerpt}
										<p class="article-excerpt">{art.excerpt}</p>
									{/if}
								</div>
								<div class="col-status">
									<Badge variant={statusVariant[art.status] ?? 'outline'}>
										{statusLabel[art.status] ?? art.status}
									</Badge>
								</div>
								<div class="col-priority">
									<span class="priority-indicator priority-{art.priority}">
										{priorityLabel[art.priority ?? 'medium'] ?? 'Medium'}
									</span>
								</div>
								<div class="col-author">
									{#if art.author?.name}
										<span class="author-name">{art.author.name}</span>
									{:else}
										<span class="text-muted-foreground">—</span>
									{/if}
								</div>
								<div class="col-updated">
									<span class="updated-date">{formatDate(art.updatedAt)}</span>
								</div>
							</a>
						{/each}
					</div>
				</div>
				<div class="articles-count">
					{data.articles.length} article{data.articles.length !== 1 ? 's' : ''}
					{#if data.filters.status && data.filters.status !== 'all'}
						&middot; filtered by {statusLabel[data.filters.status]}
					{/if}
					{#if data.filters.search}
						&middot; matching "{data.filters.search}"
					{/if}
				</div>
			{/if}
		</div>
	</PageContent>
</PageContainer>

<style>
	.authoring-content {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden;
		padding: 1rem 1.5rem;
		gap: 1rem;
	}

	.authoring-filters {
		flex-shrink: 0;
	}

	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 4rem;
		color: hsl(var(--muted-foreground));
	}

	.empty-icon {
		opacity: 0.3;
	}

	.empty-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin-top: 0.5rem;
	}

	.empty-description {
		font-size: 0.875rem;
		text-align: center;
	}

	.text-link {
		color: hsl(var(--primary));
		text-decoration: underline;
		background: none;
		border: none;
		cursor: pointer;
		font-size: inherit;
		padding: 0;
	}

	.articles-table {
		flex: 1;
		overflow: auto;
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		background: hsl(var(--background));
	}

	.articles-table-header {
		display: grid;
		grid-template-columns: 1fr 120px 90px 140px 110px;
		padding: 0.625rem 1rem;
		border-bottom: 1px solid hsl(var(--border));
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: hsl(var(--muted-foreground));
		background: hsl(var(--muted) / 0.3);
	}

	.articles-list {
		display: flex;
		flex-direction: column;
	}

	.article-row {
		display: grid;
		grid-template-columns: 1fr 120px 90px 140px 110px;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid hsl(var(--border));
		text-decoration: none;
		color: inherit;
		align-items: center;
		transition: background-color 0.1s;
	}

	.article-row:last-child {
		border-bottom: none;
	}

	.article-row:hover {
		background: hsl(var(--accent) / 0.4);
	}

	.article-headline {
		font-size: 0.875rem;
		font-weight: 500;
		color: hsl(var(--foreground));
		line-height: 1.4;
		margin-bottom: 0.125rem;
	}

	.article-excerpt {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 40ch;
	}

	.priority-indicator {
		font-size: 0.75rem;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-weight: 500;
	}

	.priority-low {
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
	}

	.priority-medium {
		background: hsl(210 100% 95%);
		color: hsl(210 100% 40%);
	}

	.priority-high {
		background: hsl(30 100% 93%);
		color: hsl(30 100% 35%);
	}

	.priority-urgent {
		background: hsl(0 100% 95%);
		color: hsl(0 70% 40%);
	}

	:global(.dark) .priority-medium {
		background: hsl(210 50% 20%);
		color: hsl(210 80% 70%);
	}

	:global(.dark) .priority-high {
		background: hsl(30 50% 20%);
		color: hsl(30 80% 70%);
	}

	:global(.dark) .priority-urgent {
		background: hsl(0 50% 20%);
		color: hsl(0 70% 70%);
	}

	.author-name {
		font-size: 0.8125rem;
		color: hsl(var(--foreground));
	}

	.updated-date {
		font-size: 0.8125rem;
		color: hsl(var(--muted-foreground));
	}

	.articles-count {
		font-size: 0.8125rem;
		color: hsl(var(--muted-foreground));
		padding: 0.25rem 0;
		flex-shrink: 0;
	}

	.col-headline,
	.col-status,
	.col-priority,
	.col-author,
	.col-updated {
		overflow: hidden;
	}
</style>
