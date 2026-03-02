<script lang="ts">
	interface Props {
		tags?: string[];
		name?: string;
		placeholder?: string;
	}

	let {
		tags = $bindable([]),
		name = 'tags',
		placeholder = 'Add tag...'
	}: Props = $props();

	let inputValue = $state('');
	let inputEl: HTMLInputElement;

	function addTag(raw: string) {
		const parts = raw.split(',').map((t) => t.trim()).filter(Boolean);
		for (const part of parts) {
			const lower = part.toLowerCase();
			if (lower && !tags.includes(lower)) {
				tags = [...tags, lower];
			}
		}
		inputValue = '';
	}

	function removeTag(index: number) {
		tags = tags.filter((_, i) => i !== index);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			if (inputValue.trim()) addTag(inputValue);
		} else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
			removeTag(tags.length - 1);
		}
	}

	function handleBlur() {
		if (inputValue.trim()) addTag(inputValue);
	}
</script>

<div class="tag-input">
	<input type="hidden" {name} value={tags.join(',')} />

	{#each tags as tag, i}
		<span class="tag-chip">
			{tag}
			<button
				type="button"
				class="tag-chip__remove"
				onclick={(e) => { e.stopPropagation(); removeTag(i); }}
				aria-label="Remove {tag}"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
				</svg>
			</button>
		</span>
	{/each}

	<input
		bind:this={inputEl}
		bind:value={inputValue}
		type="text"
		class="tag-input__text"
		{placeholder}
		onkeydown={handleKeydown}
		onblur={handleBlur}
	/>
</div>

<style>
	.tag-input {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
		min-height: 36px;
		padding: 4px 8px;
		background-color: #1a1a1a;
		border: 1px solid #333;
		border-radius: 6px;
		cursor: text;
		transition: border-color 0.15s ease;
	}

	.tag-input:focus-within {
		border-color: #5da0c8;
		outline: none;
	}

	.tag-chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 8px 2px 10px;
		background-color: #1e2a33;
		color: #5da0c8;
		border: 1px solid #2a3d4d;
		border-radius: 99px;
		font-size: 12px;
		font-weight: 500;
		white-space: nowrap;
	}

	.tag-chip__remove {
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: #5da0c8;
		cursor: pointer;
		padding: 0;
		opacity: 0.6;
		transition: opacity 0.1s;
	}

	.tag-chip__remove:hover {
		opacity: 1;
	}

	.tag-input__text {
		flex: 1;
		min-width: 120px;
		background: none;
		border: none;
		outline: none;
		color: #c8c8c8;
		font-size: 13px;
		padding: 2px 0;
	}

	.tag-input__text::placeholder {
		color: #555;
	}
</style>
