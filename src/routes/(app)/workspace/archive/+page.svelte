<script lang="ts">
	import { enhance } from '$app/forms';
	import PageContainer from '$lib/components/layout/PageContainer.svelte';
	import PageContent from '$lib/components/layout/PageContent.svelte';
	import SidePanel from '$lib/components/layout/SidePanel.svelte';
	import SidePanelContent from '$lib/components/layout/SidePanelContent.svelte';
	import SidePanelHeader from '$lib/components/layout/SidePanelHeader.svelte';
	import Toolbar from '$lib/components/layout/Toolbar.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Article = (typeof data.articles)[number];
	let selectedArticle = $state<Article | null>(null);
	let search = $state('');
	let confirming = $state<string | null>(null);

	let filtered = $derived(
		data.articles.filter((a) =>
			!search || a.headline.toLowerCase().includes(search.toLowerCase())
		)
	);

	function formatDate(date: Date | string | null) {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	function formatSize(words: number | null) {
		if (!words) return '';
		return `${words.toLocaleString()} words`;
	}
</script>

<PageContainer>
	<PageContent>
		<Toolbar>
			<span class="text-sm font-semibold text-foreground">Archive</span>
			<div class="subnav-divider"></div>
			<div class="subnav-search">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
				<input type="search" placeholder="Search archive..." class="subnav-search-input" bind:value={search} />
			</div>
			<div class="ml-auto flex items-center gap-2">
				<span class="text-xs text-muted-foreground">{filtered.length} archived article{filtered.length !== 1 ? 's' : ''}</span>
			</div>
		</Toolbar>

		<div class="archive-layout">
			<div class="archive-list">
				{#if filtered.length === 0}
					<div class="archive-empty">
						<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
						<p>No archived articles{search ? ' matching your search' : ''}</p>
					</div>
				{:else}
					{#each filtered as article (article.id)}
						<div
							class="archive-item"
							class:selected={selectedArticle?.id === article.id}
							role="button"
							tabindex="0"
							onclick={() => selectedArticle = article}
							onkeydown={(e) => e.key === 'Enter' && (selectedArticle = article)}
						>
							<div class="archive-item-body">
								<div class="archive-item-headline">{article.headline}</div>
								{#if article.excerpt}
									<div class="archive-item-excerpt">{article.excerpt}</div>
								{/if}
								<div class="archive-item-meta">
									<span>{article.author?.name || 'Unknown'}</span>
									<span class="meta-sep">·</span>
									<span>{formatDate(article.updatedAt)}</span>
									{#if article.wordCount}
										<span class="meta-sep">·</span>
										<span>{formatSize(article.wordCount)}</span>
									{/if}
								</div>
							</div>
							<div class="archive-item-actions" role="presentation" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
								<form method="POST" action="?/restore" use:enhance>
									<input type="hidden" name="id" value={article.id} />
									<button class="action-btn action-btn--restore" title="Restore to draft">
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
										Restore
									</button>
								</form>
								{#if confirming === article.id}
									<form method="POST" action="?/delete" use:enhance={() => async ({ update }) => { confirming = null; await update(); }}>
										<input type="hidden" name="id" value={article.id} />
										<button class="action-btn action-btn--confirm-delete">Confirm delete</button>
									</form>
									<button class="action-btn" onclick={() => confirming = null}>Cancel</button>
								{:else}
									<button class="action-btn action-btn--delete" onclick={() => confirming = article.id} title="Permanently delete">
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
									</button>
								{/if}
							</div>
						</div>
					{/each}
				{/if}
			</div>

			{#if selectedArticle}
				<SidePanel width={340}>
					<SidePanelHeader>
						<span class="preview-label">Article Preview</span>
						<button class="panel-close" onclick={() => selectedArticle = null} aria-label="Close">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
						</button>
					</SidePanelHeader>
					<SidePanelContent>
						<div class="preview-body">
							<h2 class="preview-headline">{selectedArticle.headline}</h2>
							{#if selectedArticle.excerpt}
								<p class="preview-excerpt">{selectedArticle.excerpt}</p>
							{/if}
							<div class="preview-meta-grid">
								<div class="meta-row">
									<span class="meta-key">Author</span>
									<span class="meta-val">{selectedArticle.author?.name || '—'}</span>
								</div>
								<div class="meta-row">
									<span class="meta-key">Archived</span>
									<span class="meta-val">{formatDate(selectedArticle.updatedAt)}</span>
								</div>
								{#if selectedArticle.publishedAt}
									<div class="meta-row">
										<span class="meta-key">Published</span>
										<span class="meta-val">{formatDate(selectedArticle.publishedAt)}</span>
									</div>
								{/if}
								{#if selectedArticle.wordCount}
									<div class="meta-row">
										<span class="meta-key">Word count</span>
										<span class="meta-val">{selectedArticle.wordCount.toLocaleString()}</span>
									</div>
								{/if}
								{#if selectedArticle.priority}
									<div class="meta-row">
										<span class="meta-key">Priority</span>
										<span class="meta-val">{selectedArticle.priority}</span>
									</div>
								{/if}
							</div>
							<div class="preview-actions">
								<form method="POST" action="?/restore" use:enhance>
									<input type="hidden" name="id" value={selectedArticle.id} />
									<button class="preview-btn preview-btn--primary">
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
										Restore to Draft
									</button>
								</form>
							</div>
						</div>
					</SidePanelContent>
				</SidePanel>
			{/if}
		</div>
	</PageContent>
</PageContainer>

<style>
	.archive-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
		gap: 0;
	}

	.archive-list {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.archive-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 80px 20px;
		color: var(--color-muted-foreground, #6b7280);
		text-align: center;
	}

	.archive-empty p {
		font-size: 0.875rem;
	}

	.archive-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		border-radius: 6px;
		border: 1px solid var(--color-border, #e5e7eb);
		background: var(--color-card, #fff);
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition: border-color 0.1s, background 0.1s;
	}

	.archive-item:hover,
	.archive-item.selected {
		border-color: var(--color-primary, #3b82f6);
		background: var(--color-accent, #f3f4f6);
	}

	.archive-item-body {
		flex: 1;
		min-width: 0;
	}

	.archive-item-headline {
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--color-foreground, #111827);
	}

	.archive-item-excerpt {
		font-size: 0.75rem;
		color: var(--color-muted-foreground, #6b7280);
		margin-top: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.archive-item-meta {
		font-size: 0.7rem;
		color: var(--color-muted-foreground, #6b7280);
		margin-top: 4px;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.meta-sep {
		opacity: 0.5;
	}

	.archive-item-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 500;
		border: 1px solid transparent;
		cursor: pointer;
		background: transparent;
		color: var(--color-muted-foreground, #6b7280);
		transition: all 0.1s;
	}

	.action-btn:hover {
		background: var(--color-accent, #f3f4f6);
		color: var(--color-foreground, #111827);
	}

	.action-btn--restore {
		color: #16a34a;
		border-color: #bbf7d0;
		background: #f0fdf4;
	}

	.action-btn--restore:hover {
		background: #dcfce7;
	}

	.action-btn--delete {
		color: #dc2626;
	}

	.action-btn--delete:hover {
		background: #fef2f2;
		color: #dc2626;
	}

	.action-btn--confirm-delete {
		color: #fff;
		background: #dc2626;
		border-color: #dc2626;
	}

	.action-btn--confirm-delete:hover {
		background: #b91c1c;
	}

	/* Side panel */
	.preview-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-muted-foreground, #6b7280);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.panel-close {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-muted-foreground, #6b7280);
		padding: 4px;
		border-radius: 4px;
		margin-left: auto;
	}

	.panel-close:hover {
		background: var(--color-accent, #f3f4f6);
		color: var(--color-foreground, #111827);
	}

	.preview-body {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.preview-headline {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-foreground, #111827);
		line-height: 1.4;
	}

	.preview-excerpt {
		font-size: 0.8rem;
		color: var(--color-muted-foreground, #6b7280);
		line-height: 1.5;
	}

	.preview-meta-grid {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.meta-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 8px;
	}

	.meta-key {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--color-muted-foreground, #6b7280);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	.meta-val {
		font-size: 0.8rem;
		color: var(--color-foreground, #111827);
		text-align: right;
	}

	.preview-actions {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.preview-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		width: 100%;
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid transparent;
		transition: all 0.1s;
	}

	.preview-btn--primary {
		background: #16a34a;
		color: #fff;
		border-color: #16a34a;
	}

	.preview-btn--primary:hover {
		background: #15803d;
	}

	/* Toolbar shared styles */
	:global(.subnav-divider) {
		width: 1px;
		height: 16px;
		background: var(--color-border, #e5e7eb);
	}

	:global(.subnav-search) {
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--color-muted-foreground, #6b7280);
	}

	:global(.subnav-search-input) {
		background: none;
		border: none;
		outline: none;
		font-size: 0.8rem;
		color: var(--color-foreground, #111827);
		width: 180px;
	}
</style>
