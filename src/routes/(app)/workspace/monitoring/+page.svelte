<script lang="ts">
	import PageContainer from '$lib/components/layout/PageContainer.svelte';
	import PageContent from '$lib/components/layout/PageContent.svelte';
	import SidePanel from '$lib/components/layout/SidePanel.svelte';
	import SidePanelContent from '$lib/components/layout/SidePanelContent.svelte';
	import SidePanelHeader from '$lib/components/layout/SidePanelHeader.svelte';
	import Toolbar from '$lib/components/layout/Toolbar.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Article = (typeof data.articles.working)[number];
	let selectedArticle = $state<Article | null>(null);

	const priorityBar: Record<string, string> = {
		low: '#9ca3af',
		medium: '#3b82f6',
		high: '#f97316',
		urgent: '#ef4444'
	};

	const statusLabel: Record<string, string> = {
		draft: 'Draft',
		working: 'In Progress',
		submitted: 'Submitted',
		published: 'Published',
		archived: 'Archived'
	};

	const statusColor: Record<string, string> = {
		draft: '#6b7280',
		working: '#3b82f6',
		submitted: '#f59e0b',
		published: '#22c55e',
		archived: '#9ca3af'
	};

	function getPriorityBar(priority: string | null | undefined): string {
		return priority && priority in priorityBar ? priorityBar[priority] : priorityBar.medium;
	}

	function formatTime(date: Date | string | null) {
		if (!date) return '';
		const d = new Date(date);
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		return `${diffDays}d ago`;
	}

	function formatDate(date: Date | string | null) {
		if (!date) return 'N/A';
		return new Date(date).toLocaleString(undefined, {
			month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
		});
	}

	const columns = [
		{ key: 'working' as const, label: 'In Progress', dateKey: 'updatedAt' as const },
		{ key: 'submitted' as const, label: 'Submitted', dateKey: 'updatedAt' as const },
		{ key: 'published' as const, label: 'Published', dateKey: 'publishedAt' as const }
	];
</script>

<PageContainer>
	<PageContent shrink>
		<Toolbar>
			<span class="text-sm font-semibold text-foreground">Monitoring</span>
			<div class="subnav-divider"></div>
			<div class="subnav-filters">
				<button class="subnav-btn">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M7 12h10M10 18h4"/></svg>
					Filters
				</button>
			</div>
			<div class="subnav-search">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
				<input type="search" placeholder="Search content..." class="subnav-search-input" />
			</div>
			<div class="ml-auto flex items-center gap-1">
				<button class="subnav-btn">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
					Refresh
				</button>
			</div>
		</Toolbar>

		<div class="board-and-panel">
			<div class="monitoring-board">
				{#each columns as col (col.key)}
					{@const articles = data.articles[col.key]}
					<div class="monitoring-group">
						<div class="monitoring-group-header">
							<span class="group-label">{col.label}</span>
							<span class="group-count">{articles.length}</span>
						</div>
						<div class="monitoring-group-items">
							{#each articles as article (article.id)}
								<button
									class="list-item"
									class:selected={selectedArticle?.id === article.id}
									onclick={() => selectedArticle = article}
								>
									<span class="priority-bar" style="background:{getPriorityBar(article.priority)}"></span>
									<div class="list-item-body">
										<div class="list-item-headline">{article.headline}</div>
										{#if article.excerpt}
											<div class="list-item-excerpt">{article.excerpt}</div>
										{/if}
										<div class="list-item-meta">
											<span class="meta-author">{article.author?.name || 'Unknown'}</span>
											<span class="meta-sep">·</span>
											<span class="meta-time">{formatTime(article[col.dateKey])}</span>
											{#if article.priority && article.priority !== 'medium'}
												<span class="priority-chip priority-chip--{article.priority}">{article.priority}</span>
											{/if}
										</div>
									</div>
								</button>
							{:else}
								<div class="empty-group">No items</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			{#if selectedArticle}
				<SidePanel width={360}>
					<SidePanelHeader>
						<span class="preview-label">Preview</span>
						<button class="panel-close" onclick={() => selectedArticle = null} aria-label="Close preview">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
						</button>
					</SidePanelHeader>
					<SidePanelContent>
						<div class="preview-body">
							<div class="preview-priority-accent" style="background:{getPriorityBar(selectedArticle.priority)}"></div>
							<h2 class="preview-headline">{selectedArticle.headline}</h2>
							<div class="preview-badges">
								{#if selectedArticle.status}
									<span class="status-badge" style="background:{statusColor[selectedArticle.status] ?? '#6b7280'}">
										{statusLabel[selectedArticle.status] ?? selectedArticle.status}
									</span>
								{/if}
								{#if selectedArticle.priority && selectedArticle.priority !== 'medium'}
									<span class="priority-chip priority-chip--{selectedArticle.priority}">{selectedArticle.priority}</span>
								{/if}
							</div>
							<div class="preview-author">
								<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
								{selectedArticle.author?.name || 'Unknown author'}
							</div>
							{#if selectedArticle.excerpt}
								<p class="preview-excerpt">{selectedArticle.excerpt}</p>
							{/if}
							<div class="preview-timestamps">
								<div class="timestamp-row">
									<span class="ts-label">Updated</span>
									<span class="ts-value">{formatDate(selectedArticle.updatedAt)}</span>
								</div>
								{#if selectedArticle.publishedAt}
									<div class="timestamp-row">
										<span class="ts-label">Published</span>
										<span class="ts-value">{formatDate(selectedArticle.publishedAt)}</span>
									</div>
								{/if}
							</div>
							<a href="/workspace/authoring/{selectedArticle.id}" class="open-editor-btn">
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
								Open in Editor
							</a>
						</div>
					</SidePanelContent>
				</SidePanel>
			{/if}
		</div>
	</PageContent>
</PageContainer>

<style>
	/* Subnav extras */
	.subnav-divider {
		width: 1px;
		height: 1.25rem;
		background: hsl(var(--border));
	}

	.subnav-filters {
		display: flex;
		gap: 0.25rem;
	}

	.subnav-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.625rem;
		border-radius: 0.25rem;
		font-size: 0.8125rem;
		color: hsl(var(--muted-foreground));
		border: 1px solid transparent;
		background: transparent;
		cursor: pointer;
		transition: background 0.1s, border-color 0.1s;
	}

	.subnav-btn:hover {
		background: hsl(var(--muted));
		border-color: hsl(var(--border));
		color: hsl(var(--foreground));
	}

	.subnav-search {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.625rem;
		border-radius: 0.25rem;
		border: 1px solid hsl(var(--border));
		background: hsl(var(--background));
		color: hsl(var(--muted-foreground));
	}

	.subnav-search-input {
		border: none;
		outline: none;
		background: transparent;
		font-size: 0.8125rem;
		width: 180px;
		color: hsl(var(--foreground));
	}

	.subnav-search-input::placeholder {
		color: hsl(var(--muted-foreground));
	}

	/* Board + panel wrapper */
	.board-and-panel {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	/* Board layout — fills remaining space after toolbar */
	.monitoring-board {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	/* Each column — takes equal width, separated by border */
	.monitoring-group {
		flex: 1;
		min-width: 260px;
		display: flex;
		flex-direction: column;
		border-right: 1px solid hsl(var(--border));
		overflow: hidden;
	}

	.monitoring-group:last-child {
		border-right: none;
	}

	/* Sticky column header */
	.monitoring-group-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 1rem;
		border-bottom: 2px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.4);
		flex-shrink: 0;
	}

	.group-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.group-count {
		font-size: 0.75rem;
		font-weight: 600;
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
		border-radius: 9999px;
		padding: 0.1rem 0.5rem;
		min-width: 1.5rem;
		text-align: center;
	}

	/* Scrollable item list */
	.monitoring-group-items {
		flex: 1;
		overflow-y: auto;
	}

	/* List item row — SuperDesk style */
	.list-item {
		display: flex;
		align-items: stretch;
		border-bottom: 1px solid hsl(var(--border));
		text-decoration: none;
		color: inherit;
		cursor: pointer;
		transition: background 0.1s;
		min-height: 3.5rem;
		width: 100%;
		text-align: left;
		background: transparent;
		border-left: none;
		border-right: none;
		border-top: none;
		padding: 0;
	}

	.list-item:hover {
		background: hsl(var(--accent));
	}

	.list-item.selected {
		background: hsl(var(--accent));
		box-shadow: inset 2px 0 0 hsl(var(--primary));
	}

	/* Left priority color bar */
	.priority-bar {
		width: 4px;
		flex-shrink: 0;
		border-radius: 0;
	}

	.list-item-body {
		flex: 1;
		padding: 0.5rem 0.75rem;
		min-width: 0;
	}

	.list-item-headline {
		font-size: 0.8125rem;
		font-weight: 500;
		line-height: 1.3;
		color: hsl(var(--foreground));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.list-item-excerpt {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
		margin-top: 0.125rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.list-item-meta {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-top: 0.25rem;
		font-size: 0.6875rem;
		color: hsl(var(--muted-foreground));
	}

	.meta-sep {
		opacity: 0.4;
	}

	.priority-chip {
		margin-left: 0.25rem;
		padding: 0.05rem 0.35rem;
		border-radius: 0.2rem;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.priority-chip--high {
		background: #fff3e0;
		color: #e65100;
	}

	.priority-chip--urgent {
		background: #fce4ec;
		color: #b71c1c;
	}

	.priority-chip--low {
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
	}

	.empty-group {
		padding: 2rem 1rem;
		text-align: center;
		font-size: 0.8125rem;
		color: hsl(var(--muted-foreground));
	}

	/* Preview panel styles */
	.preview-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: hsl(var(--muted-foreground));
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.panel-close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.25rem;
		border: none;
		background: transparent;
		cursor: pointer;
		color: hsl(var(--muted-foreground));
		transition: background 0.1s;
	}

	.panel-close:hover {
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
	}

	.preview-body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.preview-priority-accent {
		height: 3px;
		border-radius: 2px;
		margin: -0.25rem 0 0;
	}

	.preview-headline {
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.4;
		color: hsl(var(--foreground));
		margin: 0;
	}

	.preview-badges {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.status-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.15rem 0.5rem;
		border-radius: 9999px;
		font-size: 0.6875rem;
		font-weight: 600;
		color: white;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.preview-author {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: hsl(var(--muted-foreground));
	}

	.preview-excerpt {
		font-size: 0.875rem;
		line-height: 1.55;
		color: hsl(var(--muted-foreground));
		margin: 0;
		padding: 0.75rem;
		background: hsl(var(--muted) / 0.5);
		border-radius: 0.375rem;
	}

	.preview-timestamps {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 0.75rem;
		background: hsl(var(--muted) / 0.3);
		border-radius: 0.375rem;
	}

	.timestamp-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
	}

	.ts-label {
		color: hsl(var(--muted-foreground));
		font-weight: 500;
	}

	.ts-value {
		color: hsl(var(--foreground));
	}

	.open-editor-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		transition: opacity 0.15s;
		width: 100%;
	}

	.open-editor-btn:hover {
		opacity: 0.9;
	}
</style>
