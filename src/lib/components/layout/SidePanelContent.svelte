<script lang="ts">
	let { children } = $props();
</script>

<div class="side-panel-content">
	{@render children()}
</div>

<style>
	.side-panel-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
	}
</style>
