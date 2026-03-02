<script lang="ts">
	import { page } from '$app/state';
	import { tray } from '$lib/stores/tray.svelte';
	import { FileText, X } from '@lucide/svelte';

	function closeItem(e: MouseEvent, id: string) {
		e.preventDefault();
		e.stopPropagation();
		tray.removeItem(id);
	}

	function isActive(id: string) {
		return page.url.pathname === `/workspace/authoring/${id}`;
	}
</script>

{#if tray.items.length > 0}
	<div class="bottom-bar" role="navigation" aria-label="Open articles">
		<div class="bottom-bar__tabs">
			{#each tray.items as item (item.id)}
				<div class="bottom-bar__tab" class:bottom-bar__tab--active={isActive(item.id)}>
					<a
						class="bottom-bar__tab-btn"
						href="/workspace/authoring/{item.id}"
						title={item.headline}
					>
						<FileText size={14} class="bottom-bar__icon" />
						<span class="bottom-bar__title">{item.headline || 'Untitled'}</span>
					</a>
					<button
						class="bottom-bar__close"
						onclick={(e) => closeItem(e, item.id)}
						aria-label="Close {item.headline}"
						type="button"
					>
						<X size={12} />
					</button>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.bottom-bar {
		flex-shrink: 0;
		height: 3.2rem;
		background-color: hsl(214 13% 14%);
		border-top: 1px solid hsl(214 13% 22%);
		display: grid;
		grid-template-columns: 1fr;
		overflow: hidden;
		z-index: 50;
	}

	.bottom-bar__tabs {
		display: flex;
		flex-direction: row;
		align-items: center;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.bottom-bar__tabs::-webkit-scrollbar {
		display: none;
	}

	.bottom-bar__tab {
		flex: 0 1 24rem;
		min-width: 10rem;
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 3.2rem;
		border-right: 1px solid hsl(214 13% 22%);
		overflow: hidden;
		transition: background-color 0.15s;
	}

	.bottom-bar__tab:hover {
		background-color: hsl(214 13% 20%);
	}

	.bottom-bar__tab--active {
		background-color: hsl(214 13% 22%);
		border-bottom: 2px solid hsl(214 100% 65%);
	}

	.bottom-bar__tab--active:hover {
		background-color: hsl(214 13% 26%);
	}

	.bottom-bar__tab-btn {
		flex: 1;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.6rem;
		padding: 0 0.4rem 0 1.2rem;
		height: 100%;
		border: none;
		background: transparent;
		color: hsl(214 13% 70%);
		cursor: pointer;
		text-align: left;
		text-decoration: none;
		overflow: hidden;
		transition: color 0.15s;
	}

	.bottom-bar__tab-btn:hover,
	.bottom-bar__tab--active .bottom-bar__tab-btn {
		color: hsl(214 13% 92%);
	}

	.bottom-bar__tab--active .bottom-bar__tab-btn {
		color: hsl(214 100% 80%);
	}

	:global(.bottom-bar__icon) {
		flex-shrink: 0;
		opacity: 0.7;
	}

	.bottom-bar__title {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.8125rem;
		line-height: 1;
	}

	.bottom-bar__close {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.4rem;
		height: 1.4rem;
		margin-right: 0.4rem;
		border: none;
		border-radius: 0.2rem;
		background: transparent;
		color: inherit;
		cursor: pointer;
		opacity: 0.5;
		padding: 0;
		transition: opacity 0.15s, background-color 0.15s;
	}

	.bottom-bar__close:hover {
		opacity: 1;
		background-color: hsl(214 13% 35%);
	}
</style>
