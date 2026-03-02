<script lang="ts">
	let { children } = $props();
</script>

<div class="page-container">
	{@render children()}
</div>

<style>
	.page-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden;
		height: 100%;
	}
</style>
