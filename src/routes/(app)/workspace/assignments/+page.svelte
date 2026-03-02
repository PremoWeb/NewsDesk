<script lang="ts">
	import { goto } from '$app/navigation';
	import PageContainer from '$lib/components/layout/PageContainer.svelte';
	import PageContent from '$lib/components/layout/PageContent.svelte';
	import Toolbar from '$lib/components/layout/Toolbar.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state('');

	const statusColor: Record<string, string> = {
		draft: '#6b7280',
		working: '#3b82f6',
		submitted: '#f59e0b',
		published: '#22c55e',
		archived: '#9ca3af',
	};

	const statusLabel: Record<string, string> = {
		draft: 'Draft',
		working: 'In Progress',
		submitted: 'Submitted',
		published: 'Published',
		archived: 'Archived',
	};

	const priorityColor: Record<string, string> = {
		low: '#9ca3af',
		medium: '#3b82f6',
		high: '#f97316',
		urgent: '#ef4444',
	};

	let filteredGroups = $derived(
		data.groups
			.map((g) => ({
				...g,
				articles: g.articles.filter(
					(a) => !search || a.headline.toLowerCase().includes(search.toLowerCase())
				),
			}))
			.filter((g) => g.articles.length > 0)
	);

	function formatDate(date: Date | string | null) {
		if (!date) return '—';
		return new Date(date).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
		});
	}

	function getInitials(name: string) {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<PageContainer>
	<PageContent>
		<Toolbar>
			<span class="text-sm font-semibold text-foreground">Assignments</span>
			<div class="subnav-divider"></div>
			<div class="subnav-search">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
				<input type="search" placeholder="Search assignments..." class="subnav-search-input" bind:value={search} />
			</div>
			<div class="ml-auto flex items-center gap-2">
				<span class="text-xs text-muted-foreground">{data.totalAssigned} total assigned</span>
			</div>
		</Toolbar>

		<div class="assignments-content">
			{#if filteredGroups.length === 0}
				<div class="empty-state">
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
					<p>No assignments found{search ? ' matching your search' : ''}</p>
					<span>Assign articles to reporters from the Authoring workspace.</span>
				</div>
			{:else}
				{#each filteredGroups as group (group.assignee?.id ?? 'unassigned')}
					<div class="assignee-group">
						<div class="assignee-header">
							<div class="assignee-avatar">
								{#if group.assignee?.image}
									<img src={group.assignee.image} alt={group.assignee.name} />
								{:else}
									<span>{group.assignee ? getInitials(group.assignee.name) : '?'}</span>
								{/if}
							</div>
							<div class="assignee-info">
								<span class="assignee-name">{group.assignee?.name ?? 'Unassigned'}</span>
								<span class="assignee-count">{group.articles.length} article{group.articles.length !== 1 ? 's' : ''}</span>
							</div>
						</div>

						<div class="assignment-list">
							{#each group.articles as article (article.id)}
								<button
									class="assignment-item"
									onclick={() => goto(`/workspace/authoring/${article.id}`)}
								>
									<span
										class="priority-dot"
										style="background:{priorityColor[article.priority ?? 'medium'] ?? '#3b82f6'}"
									></span>
									<div class="assignment-item-body">
										<div class="assignment-headline">{article.headline}</div>
										<div class="assignment-meta">
											<span
												class="status-pill"
												style="background:{statusColor[article.status ?? 'draft']}22; color:{statusColor[article.status ?? 'draft']}"
											>
												{statusLabel[article.status ?? 'draft'] ?? article.status}
											</span>
											{#if article.deadline}
												<span class="deadline">
													<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
													Due {formatDate(article.deadline)}
												</span>
											{/if}
											<span class="assignment-date">Updated {formatDate(article.updatedAt)}</span>
										</div>
									</div>
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron"><path d="m9 18 6-6-6-6"/></svg>
								</button>
							{/each}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</PageContent>
</PageContainer>

<style>
	.assignments-content {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 80px 20px;
		color: var(--color-muted-foreground, #6b7280);
		text-align: center;
	}

	.empty-state p {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-foreground, #111827);
	}

	.empty-state span {
		font-size: 0.75rem;
	}

	.assignee-group {
		background: var(--color-card, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 8px;
		overflow: hidden;
	}

	.assignee-header {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		background: var(--color-accent, #f9fafb);
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.assignee-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--color-primary, #3b82f6);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		flex-shrink: 0;
	}

	.assignee-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.assignee-avatar span {
		font-size: 0.7rem;
		font-weight: 700;
		color: white;
	}

	.assignee-info {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.assignee-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-foreground, #111827);
	}

	.assignee-count {
		font-size: 0.7rem;
		color: var(--color-muted-foreground, #6b7280);
	}

	.assignment-list {
		display: flex;
		flex-direction: column;
	}

	.assignment-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		border: none;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
		background: transparent;
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition: background 0.1s;
	}

	.assignment-item:last-child {
		border-bottom: none;
	}

	.assignment-item:hover {
		background: var(--color-accent, #f3f4f6);
	}

	.priority-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.assignment-item-body {
		flex: 1;
		min-width: 0;
	}

	.assignment-headline {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-foreground, #111827);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.assignment-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 3px;
	}

	.status-pill {
		font-size: 0.65rem;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 10px;
	}

	.deadline {
		display: flex;
		align-items: center;
		gap: 3px;
		font-size: 0.7rem;
		color: #f97316;
	}

	.assignment-date {
		font-size: 0.7rem;
		color: var(--color-muted-foreground, #6b7280);
	}

	.chevron {
		color: var(--color-muted-foreground, #6b7280);
		flex-shrink: 0;
	}

	/* Toolbar shared */
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
