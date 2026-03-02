<script lang="ts">
	let { children } = $props();
</script>

<div class="side-panel-header">
	{@render children()}
</div>

<style>
	.side-panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid hsl(var(--border));
		min-height: 3.5rem;
	}
</style>
