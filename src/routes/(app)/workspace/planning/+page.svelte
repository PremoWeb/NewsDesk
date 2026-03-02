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

	type PlanningEvent = (typeof data.events)[number];
	type PlanningItem = PlanningEvent['items'][number];

	let showCreateEvent = $state(false);
	let showCreateItem = $state(false);
	let selectedEvent = $state<PlanningEvent | null>(null);
	let createItemEventId = $state<string | null>(null);

	const coverageTypes = ['text', 'photo', 'video', 'live', 'audio'];
	const itemStatuses = ['unassigned', 'assigned', 'in_progress', 'complete', 'cancelled'];

	const statusColor: Record<string, string> = {
		active: '#22c55e',
		cancelled: '#ef4444',
		completed: '#6b7280',
		unassigned: '#9ca3af',
		assigned: '#3b82f6',
		in_progress: '#f59e0b',
		complete: '#22c55e',
	};

	const statusLabel: Record<string, string> = {
		active: 'Active',
		cancelled: 'Cancelled',
		completed: 'Completed',
		unassigned: 'Unassigned',
		assigned: 'Assigned',
		in_progress: 'In Progress',
		complete: 'Complete',
	};

	const coverageIcon: Record<string, string> = {
		text: '📝',
		photo: '📷',
		video: '🎥',
		live: '🔴',
		audio: '🎙️',
	};


	function formatEventDate(start: Date | string, end?: Date | string | null) {
		const s = new Date(start);
		const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
		if (!end) return s.toLocaleString(undefined, opts);
		const e = new Date(end);
		if (s.toDateString() === e.toDateString()) {
			return `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${s.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}–${e.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
		}
		return `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
	}

	function formatDeadline(d: Date | string | null) {
		if (!d) return null;
		return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	function openCreateItem(eventId: string | null = null) {
		createItemEventId = eventId;
		showCreateItem = true;
	}
</script>

<PageContainer>
	<PageContent>
		<Toolbar>
			<span class="text-sm font-semibold text-foreground">Planning</span>
			<div class="subnav-divider"></div>
			<div class="ml-auto flex items-center gap-2">
				<button class="toolbar-btn" onclick={() => openCreateItem(null)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
					Coverage Item
				</button>
				<button class="toolbar-btn toolbar-btn--primary" onclick={() => showCreateEvent = true}>
					<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
					New Event
				</button>
			</div>
		</Toolbar>

		<div class="planning-layout">
			<div class="planning-main">
				<!-- Standalone items (no event) -->
				{#if data.standaloneItems.length > 0}
					<div class="planning-section">
						<div class="section-header">
							<span class="section-title">Unscheduled Coverage</span>
							<span class="section-count">{data.standaloneItems.length}</span>
						</div>
						<div class="items-list">
							{#each data.standaloneItems as item (item.id)}
								<div class="coverage-item">
									<span class="coverage-type-icon" title={item.coverageType}>{coverageIcon[item.coverageType ?? 'text'] ?? '📝'}</span>
									<div class="coverage-item-body">
										<span class="coverage-title">{item.title}</span>
										{#if item.assignee?.name}
											<span class="coverage-assignee">→ {item.assignee.name}</span>
										{/if}
									</div>
									<span class="coverage-status" style="background:{statusColor[item.status ?? 'unassigned']}22; color:{statusColor[item.status ?? 'unassigned']}">{statusLabel[item.status ?? 'unassigned']}</span>
									{#if item.deadline}
										<span class="coverage-deadline">{formatDeadline(item.deadline)}</span>
									{/if}
									<form method="POST" action="?/deleteItem" use:enhance>
										<input type="hidden" name="id" value={item.id} />
										<button class="icon-btn" title="Delete item">
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
										</button>
									</form>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Events -->
				{#if data.events.length === 0 && data.standaloneItems.length === 0}
					<div class="empty-state">
						<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
						<p>No planning events yet</p>
						<span>Create an event to track coverage and assign reporters.</span>
						<button class="empty-action-btn" onclick={() => showCreateEvent = true}>Create First Event</button>
					</div>
				{:else}
					{#each data.events as event (event.id)}
						<div class="event-card" class:event-cancelled={event.status === 'cancelled'}>
							<div class="event-header">
								<div class="event-header-left">
									<div class="event-status-dot" style="background:{statusColor[event.status ?? 'active']}"></div>
									<div class="event-info">
										<span class="event-title">{event.title}</span>
										<span class="event-date">
											<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
											{formatEventDate(event.startAt, event.endAt)}
										</span>
										{#if event.location}
											<span class="event-location">
												<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
												{event.location}
											</span>
										{/if}
									</div>
								</div>
								<div class="event-header-actions">
									<span class="coverage-count">{event.items.length} coverage item{event.items.length !== 1 ? 's' : ''}</span>
									<button class="icon-btn" onclick={() => openCreateItem(event.id)} title="Add coverage item">
										<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
									</button>
									<form method="POST" action="?/updateEventStatus" use:enhance>
										<input type="hidden" name="id" value={event.id} />
										<input type="hidden" name="status" value={event.status === 'active' ? 'completed' : 'active'} />
										<button class="icon-btn" title={event.status === 'active' ? 'Mark complete' : 'Reopen'}>
											{#if event.status === 'active'}
												<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
											{:else}
												<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
											{/if}
										</button>
									</form>
									<form method="POST" action="?/deleteEvent" use:enhance>
										<input type="hidden" name="id" value={event.id} />
										<button class="icon-btn icon-btn--danger" title="Delete event">
											<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
										</button>
									</form>
								</div>
							</div>

							{#if event.description}
								<p class="event-description">{event.description}</p>
							{/if}

							{#if event.items.length > 0}
								<div class="items-list">
									{#each event.items as item (item.id)}
										<div class="coverage-item">
											<span class="coverage-type-icon" title={item.coverageType}>{coverageIcon[item.coverageType ?? 'text'] ?? '📝'}</span>
											<div class="coverage-item-body">
												<span class="coverage-title">{item.title}</span>
												{#if item.assignee?.name}
													<span class="coverage-assignee">→ {item.assignee.name}</span>
												{/if}
											</div>
											<span class="coverage-status" style="background:{statusColor[item.status ?? 'unassigned']}22; color:{statusColor[item.status ?? 'unassigned']}">{statusLabel[item.status ?? 'unassigned']}</span>
											{#if item.deadline}
												<span class="coverage-deadline">{formatDeadline(item.deadline)}</span>
											{/if}
											<form method="POST" action="?/deleteItem" use:enhance>
												<input type="hidden" name="id" value={item.id} />
												<button class="icon-btn" title="Delete item">
													<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
												</button>
											</form>
										</div>
									{/each}
								</div>
							{:else}
								<div class="event-no-items">No coverage items yet — <button class="inline-btn" onclick={() => openCreateItem(event.id)}>add one</button></div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</PageContent>
</PageContainer>

<!-- Create Event Modal -->
{#if showCreateEvent}
	<div class="modal-backdrop" onclick={() => showCreateEvent = false} role="presentation" aria-hidden="true"></div>
	<div class="modal" role="dialog" aria-label="Create Event" aria-modal="true">
		<div class="modal-header">
			<span class="modal-title">Create Planning Event</span>
		<button class="modal-close" aria-label="Close" onclick={() => showCreateEvent = false}>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
			</button>
		</div>
		<form method="POST" action="?/createEvent" class="modal-form" use:enhance={() => async ({ update }) => { await update(); showCreateEvent = false; }}>
			<div class="form-group">
				<label for="event-title">Event Title *</label>
				<input id="event-title" name="title" required placeholder="e.g. City Council Meeting" />
			</div>
			<div class="form-group">
				<label for="event-desc">Description</label>
				<textarea id="event-desc" name="description" rows="2" placeholder="Brief description..."></textarea>
			</div>
			<div class="form-row">
				<div class="form-group">
					<label for="event-start">Start Date & Time *</label>
					<input id="event-start" name="startAt" type="datetime-local" required />
				</div>
				<div class="form-group">
					<label for="event-end">End Date & Time</label>
					<input id="event-end" name="endAt" type="datetime-local" />
				</div>
			</div>
			<div class="form-group">
				<label for="event-loc">Location</label>
				<input id="event-loc" name="location" placeholder="e.g. City Hall, Room 200" />
			</div>
			<div class="modal-footer">
				<button type="button" class="btn-cancel" onclick={() => showCreateEvent = false}>Cancel</button>
				<button type="submit" class="btn-submit">Create Event</button>
			</div>
		</form>
	</div>
{/if}

<!-- Create Coverage Item Modal -->
{#if showCreateItem}
	<div class="modal-backdrop" onclick={() => showCreateItem = false} role="presentation" aria-hidden="true"></div>
	<div class="modal" role="dialog" aria-label="Create Coverage Item" aria-modal="true">
		<div class="modal-header">
			<span class="modal-title">Add Coverage Item</span>
		<button class="modal-close" aria-label="Close" onclick={() => showCreateItem = false}>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
			</button>
		</div>
		<form method="POST" action="?/createItem" class="modal-form" use:enhance={() => async ({ update }) => { await update(); showCreateItem = false; }}>
			<input type="hidden" name="eventId" value={createItemEventId ?? ''} />
			<div class="form-group">
				<label for="item-title">Title *</label>
				<input id="item-title" name="title" required placeholder="e.g. Main story, Photo gallery" />
			</div>
			<div class="form-group">
				<label for="item-desc">Description</label>
				<textarea id="item-desc" name="description" rows="2" placeholder="Details..."></textarea>
			</div>
			<div class="form-row">
				<div class="form-group">
					<label for="item-type">Coverage Type</label>
					<select id="item-type" name="coverageType">
						{#each coverageTypes as type}
							<option value={type}>{coverageIcon[type]} {type.charAt(0).toUpperCase() + type.slice(1)}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="item-assignee">Assign To</label>
					<select id="item-assignee" name="assignedTo">
						<option value="">— Unassigned —</option>
						{#each data.allUsers as u (u.id)}
							<option value={u.id}>{u.name}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="form-group">
				<label for="item-deadline">Deadline</label>
				<input id="item-deadline" name="deadline" type="datetime-local" />
			</div>
			<div class="modal-footer">
				<button type="button" class="btn-cancel" onclick={() => showCreateItem = false}>Cancel</button>
				<button type="submit" class="btn-submit">Add Item</button>
			</div>
		</form>
	</div>
{/if}

<style>
	.planning-layout {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
	}

	.planning-main {
		display: flex;
		flex-direction: column;
		gap: 16px;
		max-width: 900px;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 5px 10px;
		border-radius: 5px;
		font-size: 0.75rem;
		font-weight: 500;
		border: 1px solid var(--color-border, #e5e7eb);
		background: var(--color-card, #fff);
		color: var(--color-foreground, #111827);
		cursor: pointer;
		transition: all 0.1s;
	}

	.toolbar-btn:hover {
		background: var(--color-accent, #f3f4f6);
	}

	.toolbar-btn--primary {
		background: var(--color-primary, #3b82f6);
		color: white;
		border-color: var(--color-primary, #3b82f6);
	}

	.toolbar-btn--primary:hover {
		background: #2563eb;
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

	.empty-action-btn {
		margin-top: 8px;
		padding: 8px 16px;
		background: var(--color-primary, #3b82f6);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
	}

	.planning-section {
		background: var(--color-card, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 8px;
		overflow: hidden;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		background: var(--color-accent, #f9fafb);
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.section-title {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-foreground, #111827);
	}

	.section-count {
		font-size: 0.7rem;
		color: var(--color-muted-foreground, #6b7280);
		background: var(--color-border, #e5e7eb);
		padding: 1px 6px;
		border-radius: 10px;
	}

	.event-card {
		background: var(--color-card, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 8px;
		overflow: hidden;
	}

	.event-cancelled {
		opacity: 0.6;
	}

	.event-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 14px;
		background: var(--color-accent, #f9fafb);
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.event-header-left {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		flex: 1;
		min-width: 0;
	}

	.event-status-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
		margin-top: 4px;
	}

	.event-info {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}

	.event-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-foreground, #111827);
	}

	.event-date,
	.event-location {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.7rem;
		color: var(--color-muted-foreground, #6b7280);
	}

	.event-header-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.coverage-count {
		font-size: 0.7rem;
		color: var(--color-muted-foreground, #6b7280);
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border-radius: 4px;
		border: 1px solid var(--color-border, #e5e7eb);
		background: var(--color-card, #fff);
		cursor: pointer;
		color: var(--color-muted-foreground, #6b7280);
		transition: all 0.1s;
	}

	.icon-btn:hover {
		background: var(--color-accent, #f3f4f6);
		color: var(--color-foreground, #111827);
	}

	.icon-btn--danger:hover {
		background: #fef2f2;
		color: #dc2626;
		border-color: #fecaca;
	}

	.event-description {
		font-size: 0.8rem;
		color: var(--color-muted-foreground, #6b7280);
		padding: 8px 14px;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.items-list {
		display: flex;
		flex-direction: column;
	}

	.coverage-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 14px;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.coverage-item:last-child {
		border-bottom: none;
	}

	.coverage-type-icon {
		font-size: 0.9rem;
		flex-shrink: 0;
	}

	.coverage-item-body {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.coverage-title {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-foreground, #111827);
	}

	.coverage-assignee {
		font-size: 0.7rem;
		color: var(--color-muted-foreground, #6b7280);
	}

	.coverage-status {
		font-size: 0.65rem;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 10px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.coverage-deadline {
		font-size: 0.7rem;
		color: #f97316;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.event-no-items {
		padding: 10px 14px;
		font-size: 0.75rem;
		color: var(--color-muted-foreground, #6b7280);
	}

	.inline-btn {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: var(--color-primary, #3b82f6);
		font-size: inherit;
		text-decoration: underline;
	}

	/* Modal */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 50;
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 51;
		background: var(--color-card, #fff);
		border-radius: 10px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
		width: 540px;
		max-width: calc(100vw - 32px);
		max-height: calc(100vh - 64px);
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.modal-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-foreground, #111827);
		flex: 1;
	}

	.modal-close {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-muted-foreground, #6b7280);
		padding: 4px;
		border-radius: 4px;
	}

	.modal-close:hover {
		background: var(--color-accent, #f3f4f6);
	}

	.modal-form {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.form-group label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-foreground, #111827);
	}

	.form-group input,
	.form-group textarea,
	.form-group select {
		padding: 8px 10px;
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 6px;
		font-size: 0.8rem;
		background: var(--color-background, #fff);
		color: var(--color-foreground, #111827);
		outline: none;
		transition: border-color 0.1s;
		width: 100%;
	}

	.form-group input:focus,
	.form-group textarea:focus,
	.form-group select:focus {
		border-color: var(--color-primary, #3b82f6);
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		padding-top: 4px;
	}

	.btn-cancel,
	.btn-submit {
		padding: 8px 16px;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid var(--color-border, #e5e7eb);
		transition: all 0.1s;
	}

	.btn-cancel {
		background: var(--color-card, #fff);
		color: var(--color-foreground, #111827);
	}

	.btn-cancel:hover {
		background: var(--color-accent, #f3f4f6);
	}

	.btn-submit {
		background: var(--color-primary, #3b82f6);
		color: white;
		border-color: var(--color-primary, #3b82f6);
	}

	.btn-submit:hover {
		background: #2563eb;
	}

	/* Toolbar shared */
	:global(.subnav-divider) {
		width: 1px;
		height: 16px;
		background: var(--color-border, #e5e7eb);
	}
</style>
