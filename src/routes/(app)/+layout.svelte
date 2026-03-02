<script lang="ts">
	import AppShell from '$lib/components/layout/AppShell.svelte';
	import { Toaster } from 'svelte-sonner';
	
	let { children } = $props();
</script>

<Toaster richColors position="top-right" />
<AppShell>
	{@render children()}
</AppShell>
