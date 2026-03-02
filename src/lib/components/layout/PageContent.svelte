<script lang="ts">
	interface Props {
		shrink?: boolean;
		children?: import('svelte').Snippet;
	}
	
	let { shrink = false, children }: Props = $props();
</script>

<div class="page-content" class:page-content--shrink={shrink}>
	{@render children?.()}
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow-y: auto;
	}

	.page-content--shrink {
		flex: 1;
	}
</style>
