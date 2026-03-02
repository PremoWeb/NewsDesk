<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import Button from '$lib/components/ui/button/button.svelte';

	let { ontoggleMenu }: { ontoggleMenu: () => void } = $props();

	// TODO: Get from session/auth
	let user = $state({
		name: 'Demo User',
		email: 'demo@newsdesk.local',
		avatar: null as string | null
	});
</script>

<nav class="top-nav">
	<!-- Hamburger -->
	<button class="top-nav__hamburger" onclick={ontoggleMenu} aria-label="Open main menu">
		<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<line x1="3" y1="6" x2="21" y2="6"/>
			<line x1="3" y1="12" x2="21" y2="12"/>
			<line x1="3" y1="18" x2="21" y2="18"/>
		</svg>
	</button>

	<div class="top-nav__brand">
		<a href="/" class="top-nav__logo">
			<span class="top-nav__logo-text">NewsDesk</span>
		</a>
	</div>

	<div class="top-nav__spacer"></div>

	<div class="top-nav__actions">
		<Button variant="ghost" size="icon" aria-label="Notifications">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
				<path d="M13.73 21a2 2 0 0 1-3.46 0"/>
			</svg>
		</Button>

		<a href="/settings" aria-label="Settings">
			<Button variant="ghost" size="icon" tabindex={-1}>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
					<circle cx="12" cy="12" r="3"/>
				</svg>
			</Button>
		</a>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Avatar.Root class="h-8 w-8 cursor-pointer">
					<Avatar.Fallback>{user.name.charAt(0)}</Avatar.Fallback>
				</Avatar.Root>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Label>
					<div class="flex flex-col space-y-1">
						<p class="text-sm font-medium">{user.name}</p>
						<p class="text-xs text-muted-foreground">{user.email}</p>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Item><a href="/profile" class="block w-full">Profile</a></DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item class="text-destructive">
					<a href="/auth/logout" class="block w-full">Sign out</a>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</nav>

<style>
	.top-nav {
		display: flex;
		align-items: center;
		height: 3.5rem;
		border-bottom: 1px solid hsl(var(--border));
		background: hsl(var(--background));
		padding: 0 0.75rem;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.top-nav__hamburger {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		background: transparent;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
		border-radius: 6px;
		transition: background-color 0.15s ease, color 0.15s ease;
		flex-shrink: 0;
	}

	.top-nav__hamburger:hover {
		background: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
	}

	.top-nav__brand {
		display: flex;
		align-items: center;
	}

	.top-nav__logo {
		display: flex;
		align-items: center;
		text-decoration: none;
		color: hsl(var(--foreground));
		font-weight: 600;
		font-size: 1.25rem;
	}

	.top-nav__logo-text {
		color: hsl(var(--primary));
	}

	.top-nav__spacer {
		flex: 1;
	}

	.top-nav__actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
