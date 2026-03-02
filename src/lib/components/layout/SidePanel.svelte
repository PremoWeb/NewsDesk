<script lang="ts">
	interface Props {
		side?: 'left' | 'right';
		width?: number;
		children?: import('svelte').Snippet;
	}
	
	let { side = 'right', width = 320, children }: Props = $props();
</script>

<aside class="side-panel side-panel--{side}" style="width: {width}px;">
	{@render children?.()}
</aside>

<style>
	.side-panel {
		display: flex;
		flex-direction: column;
		border-left: 1px solid hsl(var(--border));
		background: hsl(var(--background));
		overflow: hidden;
	}

	.side-panel--left {
		border-left: none;
		border-right: 1px solid hsl(var(--border));
	}

	.side-panel--right {
		border-right: none;
	}
</style>
