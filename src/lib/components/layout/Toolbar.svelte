<script lang="ts">
	let { children } = $props();
</script>

<div class="toolbar">
	{@render children()}
</div>

<style>
	.toolbar {
		display: flex;
		align-items: center;
		min-height: 3rem;
		padding: 0.5rem 1rem;
		border-bottom: 1px solid hsl(var(--border));
		background: hsl(var(--background));
		gap: 1rem;
		flex-wrap: wrap;
	}
</style>
