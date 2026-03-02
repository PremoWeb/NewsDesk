<script lang="ts">
	import { browser } from '$app/environment';
	import TopNav from './TopNav.svelte';
	import MainMenuPanel from './MainMenuPanel.svelte';
	import BottomBar from './BottomBar.svelte';

	let { children } = $props();

	let menuOpen = $state(false);
	let menuPinned = $state(browser ? localStorage.getItem('menu-pinned') === 'true' : false);

	$effect(() => {
		if (browser) localStorage.setItem('menu-pinned', String(menuPinned));
		if (menuPinned) menuOpen = true;
	});

	function toggleMenu() {
		if (menuPinned) return; // hamburger does nothing while pinned; click pin to unpin
		menuOpen = !menuOpen;
	}
</script>

<div class="app-shell">
	<TopNav ontoggleMenu={toggleMenu} />
	<MainMenuPanel bind:open={menuOpen} bind:pinned={menuPinned} />
	<main class="app-main" class:app-main--shifted={menuPinned}>
		{@render children()}
	</main>
	<div class="bottom-bar-wrapper" class:bottom-bar-wrapper--shifted={menuPinned}>
		<BottomBar />
	</div>
</div>

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	.app-main {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		margin-left: 0;
		transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.app-main--shifted {
		margin-left: 280px;
	}

	.bottom-bar-wrapper {
		margin-left: 0;
		transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.bottom-bar-wrapper--shifted {
		margin-left: 280px;
	}
</style>
