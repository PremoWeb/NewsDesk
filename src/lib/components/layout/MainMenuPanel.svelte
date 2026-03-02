<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { open = $bindable(false), pinned = $bindable(false) } = $props();

	let createOpen = $state(false);

	const navItems = [
		{ href: '/workspace/dashboard', label: 'Dashboard' },
		{ href: '/workspace/monitoring', label: 'Monitoring' },
		{ href: '/workspace/authoring', label: 'Authoring' },
		{ href: '/workspace/search', label: 'Search' },
		{ href: '/workspace/planning', label: 'Planning' },
		{ href: '/workspace/assignments', label: 'Assignments' },
		{ href: '/workspace/archive', label: 'Archive' },
		{ href: '/workspace/media', label: 'Media Library' },
	];

	const createItems = [
		{
			label: 'New Article',
			description: 'Start a blank text article',
			href: '/workspace/authoring/new',
			icon: 'article',
		},
		{
			label: 'New Package',
			description: 'Group articles into a package',
			href: '/workspace/authoring/new?type=package',
			icon: 'package',
		},
		{
			label: 'Upload Media',
			description: 'Upload photos or video',
			href: '/workspace/authoring/new?type=media',
			icon: 'media',
		},
	];

	function close() {
		if (!pinned) open = false;
		createOpen = false;
	}

	function togglePin() {
		pinned = !pinned;
		if (pinned) open = true;
	}

	function toggleCreate() {
		createOpen = !createOpen;
	}

	function handleCreate(href: string) {
		createOpen = false;
		close();
		goto(href);
	}

	function isActive(href: string) {
		return page.url.pathname.startsWith(href);
	}
</script>

{#if open && !pinned}
	<div
		class="main-menu-backdrop"
		onclick={close}
		role="presentation"
		aria-hidden="true"
	></div>
{/if}

<nav
	class="main-menu"
	class:main-menu--open={open}
	class:main-menu--pinned={pinned}
	aria-label="Main menu"
	aria-hidden={!open}
>
	<div class="main-menu__header">
		<h2 class="main-menu__heading">Main menu</h2>
		<div class="main-menu__header-actions">
			<button
				class="main-menu__action-btn"
				class:main-menu__action-btn--active={pinned}
				onclick={togglePin}
				aria-label={pinned ? 'Unpin menu' : 'Pin menu open'}
				title={pinned ? 'Unpin menu' : 'Pin menu open'}
			>
				<!-- pin icon -->
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={pinned ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="12" y1="17" x2="12" y2="22"/>
					<path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
				</svg>
			</button>
			{#if !pinned}
				<button class="main-menu__action-btn" onclick={close} aria-label="Close menu">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"/>
						<line x1="6" y1="6" x2="18" y2="18"/>
					</svg>
				</button>
			{/if}
		</div>
	</div>

	<div class="main-menu__content">
		<ul class="main-menu__list">
			{#each navItems as item (item.href)}
				<li class="main-menu__list-item">
					<a
						href={item.href}
						class="main-menu__link"
						class:main-menu__link--active={isActive(item.href)}
						onclick={close}
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>


	</div>

	<!-- Slide-up create panel (sits in flex flow above footer) -->
	<div class="main-menu__create-panel" class:main-menu__create-panel--open={createOpen} aria-hidden={!createOpen}>
		<div class="main-menu__create-panel-header">
			<span class="main-menu__create-panel-title">Create</span>
			<button class="main-menu__action-btn" onclick={toggleCreate} aria-label="Close create panel">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"/>
					<line x1="6" y1="6" x2="18" y2="18"/>
				</svg>
			</button>
		</div>
		<ul class="main-menu__create-list">
			{#each createItems as item}
				<li>
					<button class="main-menu__create-item" onclick={() => handleCreate(item.href)}>
						<span class="main-menu__create-item-icon">
							{#if item.icon === 'article'}
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
							{:else if item.icon === 'package'}
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
							{/if}
						</span>
						<span class="main-menu__create-item-text">
							<span class="main-menu__create-item-label">{item.label}</span>
							<span class="main-menu__create-item-desc">{item.description}</span>
						</span>
					</button>
				</li>
			{/each}
		</ul>
	</div>

	<div class="main-menu__footer">
		<span class="main-menu__footer-brand">NewsDesk</span>
		<button
			class="main-menu__create-btn"
			class:main-menu__create-btn--active={createOpen}
			onclick={toggleCreate}
			aria-label="Create new item"
			title="Create new item"
			aria-expanded={createOpen}
		>
			<span class="main-menu__create-btn-circle">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<line x1="12" y1="5" x2="12" y2="19"/>
					<line x1="5" y1="12" x2="19" y2="12"/>
				</svg>
			</span>
		</button>
	</div>
</nav>

<style>
	.main-menu-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 40;
	}

	.main-menu {
		position: fixed;
		top: 0;
		left: 0;
		height: 100dvh;
		width: 280px;
		background-color: #1a1a2e;
		display: flex;
		flex-direction: column;
		z-index: 50;
		transform: translateX(-100%);
		transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
		overflow: hidden;
	}

	.main-menu--open {
		transform: translateX(0);
	}

	.main-menu--pinned {
		box-shadow: none;
		border-right: 1px solid rgba(255, 255, 255, 0.06);
	}

	.main-menu__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem 1.25rem 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.main-menu__heading {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.4);
		margin: 0;
	}

	.main-menu__header-actions {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.main-menu__action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border: none;
		background: transparent;
		color: rgba(255, 255, 255, 0.35);
		cursor: pointer;
		border-radius: 6px;
		transition: background-color 0.15s ease, color 0.15s ease;
	}

	.main-menu__action-btn:hover {
		background: rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.9);
	}

	.main-menu__action-btn--active {
		color: #4a9eff;
	}

	.main-menu__action-btn--active:hover {
		color: #7ab8ff;
	}

	.main-menu__content {
		flex: 1;
		overflow-y: auto;
		padding: 0.75rem 0;
	}

	.main-menu__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.main-menu__section-label {
		padding: 1rem 1.5rem 0.375rem;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.3);
	}

	.main-menu__list-item {
		margin: 0;
	}

	.main-menu__link {
		display: block;
		padding: 0.875rem 1.5rem;
		font-size: 1rem;
		font-weight: 400;
		color: rgba(255, 255, 255, 0.65);
		text-decoration: none;
		letter-spacing: 0.01em;
		transition: background-color 0.15s ease, color 0.15s ease, padding-left 0.15s ease;
		border-left: 3px solid transparent;
	}

	.main-menu__link:hover {
		background: rgba(255, 255, 255, 0.06);
		color: rgba(255, 255, 255, 0.9);
		padding-left: 1.75rem;
	}

	.main-menu__link--active {
		color: #4a9eff;
		border-left-color: #4a9eff;
		background: rgba(74, 158, 255, 0.08);
		font-weight: 500;
	}

	.main-menu__footer {
		padding: 0.75rem 1.25rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		z-index: 1;
	}

	.main-menu__footer-brand {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.25);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		font-weight: 600;
	}

	/* Create button */
	.main-menu__create-btn {
		width: 40px;
		height: 40px;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.main-menu__create-btn-circle {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background-color: #2563eb;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.5);
	}

	.main-menu__create-btn:hover .main-menu__create-btn-circle {
		width: 38px;
		height: 38px;
		background-color: #3b82f6;
	}

	.main-menu__create-btn--active .main-menu__create-btn-circle {
		background-color: #1d4ed8;
		transform: rotate(45deg);
	}

	/* Slide-up create panel — lives in flex flow above footer */
	.main-menu__create-panel {
		background-color: #141428;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.3);
	}

	.main-menu__create-panel--open {
		max-height: 300px;
	}

	.main-menu__create-panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 1.25rem 0.5rem;
	}

	.main-menu__create-panel-title {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: rgba(255, 255, 255, 0.35);
	}

	.main-menu__create-list {
		list-style: none;
		margin: 0;
		padding: 0 0 0.5rem;
	}

	.main-menu__create-item {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		width: 100%;
		padding: 0.75rem 1.25rem;
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.15s ease;
		color: rgba(255, 255, 255, 0.75);
	}

	.main-menu__create-item:hover {
		background: rgba(255, 255, 255, 0.06);
		color: white;
	}

	.main-menu__create-item-icon {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(37, 99, 235, 0.2);
		border-radius: 8px;
		color: #60a5fa;
		flex-shrink: 0;
	}

	.main-menu__create-item-text {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.main-menu__create-item-label {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.main-menu__create-item-desc {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.35);
	}
</style>
