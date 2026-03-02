<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import PageContainer from '$lib/components/layout/PageContainer.svelte';
	import PageContent from '$lib/components/layout/PageContent.svelte';
	import Toolbar from '$lib/components/layout/Toolbar.svelte';
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchValue = $state(untrack(() => data.q ?? ''));
	let statusFilter = $state(untrack(() => data.status ?? 'all'));

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

	function applySearch() {
		const params = new URLSearchParams();
		if (searchValue.trim()) params.set('q', searchValue.trim());
		if (statusFilter !== 'all') params.set('status', statusFilter);
		goto(`/workspace/search?${params.toString()}`, { replaceState: true });
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') applySearch();
	}

	function setStatus(value: string) {
		statusFilter = value;
		const params = new URLSearchParams(page.url.searchParams);
		if (value === 'all') params.delete('status');
		else params.set('status', value);
		if (searchValue.trim()) params.set('q', searchValue.trim());
		else params.delete('q');
		goto(`/workspace/search?${params.toString()}`, { replaceState: true });
	}

	function formatDate(date: Date | string | null) {
		if (!date) return '';
		const d = new Date(date);
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);
		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<PageContainer>
	<Toolbar>
		<span class="toolbar-title">Search</span>
		<div class="search-input-wrap">
			<Input
				type="search"
				placeholder="Search articles by headline, excerpt, or byline…"
				bind:value={searchValue}
				onkeydown={handleKeydown}
			/>
		</div>
		<Button variant="default" size="sm" onclick={applySearch}>Search</Button>
	</Toolbar>

	<div class="status-tabs">
		{#each statusTabs as tab (tab.value)}
			<button
				class="status-tab"
				class:status-tab--active={statusFilter === tab.value}
				onclick={() => setStatus(tab.value)}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<PageContent shrink>
		{#if data.q || data.status !== 'all'}
			<div class="results-header">
				{#if data.q}
					<span>Results for <strong>"{data.q}"</strong></span>
				{:else}
					<span>Filtered articles</span>
				{/if}
				<span class="results-count">{data.total} {data.total === 1 ? 'result' : 'results'}</span>
			</div>
		{:else}
			<div class="empty-state">
				<div class="empty-icon">🔍</div>
				<p class="empty-title">Search articles</p>
				<p class="empty-subtitle">Type a keyword above to search across all articles</p>
			</div>
		{/if}

		{#if (data.q || data.status !== 'all') && data.results.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📭</div>
				<p class="empty-title">No results found</p>
				<p class="empty-subtitle">Try a different search term or change the status filter</p>
			</div>
		{/if}

		{#if data.results.length > 0}
			<ul class="results-list">
				{#each data.results as result (result.id)}
					<li class="result-item">
						<a href="/workspace/authoring/{result.id}" class="result-link">
							<div class="result-main">
								<div class="result-headline">{result.headline}</div>
								{#if result.excerpt}
									<div class="result-excerpt">{result.excerpt}</div>
								{/if}
								<div class="result-meta">
									<Badge variant={statusVariant[result.status] ?? 'outline'} class="capitalize result-badge">
										{statusLabel[result.status] ?? result.status}
									</Badge>
									{#if result.author?.name}
										<span class="meta-item">by {result.author.name}</span>
									{/if}
									{#if result.wordCount}
										<span class="meta-item">{result.wordCount} words</span>
									{/if}
									{#if result.readTime}
										<span class="meta-item">{result.readTime} min read</span>
									{/if}
									<span class="meta-item">{formatDate(result.updatedAt)}</span>
								</div>
								{#if result.tags.length > 0}
									<div class="result-tags">
										{#each result.tags.slice(0, 5) as t (t)}
											<span class="tag-chip">{t}</span>
										{/each}
									</div>
								{/if}
							</div>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</PageContent>
</PageContainer>

<style>
	.toolbar-title {
		font-weight: 600;
		font-size: 1rem;
		white-space: nowrap;
	}

	.search-input-wrap {
		flex: 1;
		max-width: 40rem;
	}

	.status-tabs {
		display: flex;
		gap: 0;
		padding: 0 1rem;
		border-bottom: 1px solid hsl(var(--border));
		background: hsl(var(--background));
		overflow-x: auto;
		scrollbar-width: none;
	}

	.status-tab {
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		border-bottom: 2px solid transparent;
		border-top: none;
		border-left: none;
		border-right: none;
		white-space: nowrap;
		cursor: pointer;
		background: none;
		transition: color 0.15s, border-color 0.15s;
	}

	.status-tab:hover {
		color: hsl(var(--foreground));
	}

	.status-tab--active {
		color: hsl(var(--foreground));
		border-bottom-color: hsl(var(--foreground));
		font-weight: 500;
	}

	.results-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 0;
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		border-bottom: 1px solid hsl(var(--border));
		margin-bottom: 0.5rem;
	}

	.results-count {
		font-weight: 500;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		gap: 0.5rem;
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.empty-title {
		font-size: 1rem;
		font-weight: 500;
		color: hsl(var(--foreground));
	}

	.empty-subtitle {
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	.results-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.result-item {
		border-bottom: 1px solid hsl(var(--border));
	}

	.result-link {
		display: block;
		text-decoration: none;
		color: inherit;
		transition: background-color 0.1s;
	}

	.result-link:hover {
		background: hsl(var(--muted) / 0.4);
	}

	.result-link:hover .result-headline {
		color: hsl(var(--primary));
	}

	.result-main {
		padding: 1rem;
	}

	.result-headline {
		font-size: 0.9375rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin-bottom: 0.25rem;
		transition: color 0.1s;
	}

	.result-excerpt {
		font-size: 0.8125rem;
		color: hsl(var(--muted-foreground));
		margin-bottom: 0.5rem;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		line-height: 1.5;
	}

	.result-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
	}

	.meta-item::before {
		content: '·';
		margin-right: 0.5rem;
	}

	.result-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-top: 0.5rem;
	}

	.tag-chip {
		font-size: 0.6875rem;
		padding: 0.125rem 0.5rem;
		border-radius: 999px;
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
	}
</style>
