<script lang="ts">
	import PageContainer from '$lib/components/layout/PageContainer.svelte';
	import PageContent from '$lib/components/layout/PageContent.svelte';
	import Toolbar from '$lib/components/layout/Toolbar.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatTime(date: Date | string | null) {
		if (!date) return 'Unknown';
		const d = new Date(date);
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins} mins ago`;
		if (diffHours < 24) return `${diffHours} hours ago`;
		return `${diffDays} days ago`;
	}

	const statusColors = {
		draft: 'bg-gray-100 text-gray-700',
		working: 'bg-blue-100 text-blue-700',
		submitted: 'bg-yellow-100 text-yellow-700',
		published: 'bg-green-100 text-green-700',
		archived: 'bg-gray-100 text-gray-500'
	} as const;

	type Status = keyof typeof statusColors;

	function getStatusColor(status: string | null | undefined): string {
		if (!status || !(status in statusColors)) return statusColors.draft;
		return statusColors[status as Status];
	}
</script>

<PageContainer>
	<Toolbar>
		<span class="toolbar-title">Dashboard</span>
		<a href="/workspace/authoring/new" class="new-article-btn">+ New Article</a>
	</Toolbar>
	<PageContent shrink>
		<div class="dashboard-container">
			<div class="dashboard-grid">
				<div class="dashboard-card">
					<h3 class="text-lg font-semibold mb-2">Quick Stats</h3>
					<div class="stats-grid">
						<div class="stat-item">
							<div class="stat-value">{data.stats.total}</div>
							<div class="stat-label">Total Articles</div>
						</div>
						<div class="stat-item">
							<div class="stat-value">{data.stats.working}</div>
							<div class="stat-label">In Progress</div>
						</div>
						<div class="stat-item">
							<div class="stat-value">{data.stats.submitted}</div>
							<div class="stat-label">Submitted</div>
						</div>
						<div class="stat-item">
							<div class="stat-value">{data.stats.published}</div>
							<div class="stat-label">Published</div>
						</div>
					</div>
				</div>

				<div class="dashboard-card">
					<h3 class="text-lg font-semibold mb-2">Quick Actions</h3>
					<div class="flex flex-col gap-2">
						<a href="/workspace/authoring/new" class="quick-action-link">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 5v14M5 12h14"/>
							</svg>
							New Article
						</a>
						<a href="/workspace/monitoring" class="quick-action-link">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="2" y="3" width="20" height="14" rx="2"/>
								<path d="M8 21h8M12 17v4"/>
							</svg>
							Monitoring
						</a>
						<a href="/workspace/authoring" class="quick-action-link">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
							</svg>
							All Articles
						</a>
						<a href="/workspace/search" class="quick-action-link">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="11" cy="11" r="8"/>
								<path d="m21 21-4.35-4.35"/>
							</svg>
							Search
						</a>
					</div>
				</div>

				<div class="dashboard-card col-span-2">
					<h3 class="text-lg font-semibold mb-4">Recent Activity</h3>
					<div class="space-y-2">
						{#each data.recentArticles as article}
							<Card.Root class="cursor-pointer hover:bg-accent/50 transition-colors">
								<Card.Header class="p-3">
									<div class="flex items-start justify-between gap-2">
										<Card.Title class="text-sm font-medium">{article.headline}</Card.Title>
										{#if article.status}
										<Badge variant="secondary" class={getStatusColor(article.status)}>
												{article.status}
											</Badge>
										{/if}
									</div>
									<Card.Description class="text-xs">
										Updated {formatTime(article.updatedAt)}
									</Card.Description>
								</Card.Header>
							</Card.Root>
						{:else}
							<p class="text-sm text-muted-foreground">No recent activity</p>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</PageContent>
</PageContainer>

<style>
	.toolbar-title {
		font-weight: 600;
		font-size: 1rem;
	}

	.new-article-btn {
		padding: 0.375rem 0.875rem;
		border-radius: 0.375rem;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		font-size: 0.8125rem;
		font-weight: 500;
		text-decoration: none;
		transition: opacity 0.15s;
	}

	.new-article-btn:hover {
		opacity: 0.9;
	}

	.quick-action-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		border: 1px solid hsl(var(--border));
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		font-size: 0.875rem;
		text-decoration: none;
		transition: background-color 0.15s;
	}

	.quick-action-link:hover {
		background: hsl(var(--muted));
	}

	.dashboard-container {
		padding: 2rem;
		flex: 1;
		overflow-y: auto;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
	}

	.dashboard-card {
		padding: 1.5rem;
		border-radius: 0.5rem;
		border: 1px solid hsl(var(--border));
		background: hsl(var(--card));
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.stat-item {
		text-align: center;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: hsl(var(--primary));
	}

	.stat-label {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
	}

	.col-span-2 {
		grid-column: span 2;
	}
</style>
