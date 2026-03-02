<script lang="ts">
	import { onMount, onDestroy, untrack } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Placeholder from '@tiptap/extension-placeholder';
	import CharacterCount from '@tiptap/extension-character-count';

	interface Props {
		content?: string;
		name?: string;
		placeholder?: string;
		onWordCount?: (count: number) => void;
		class?: string;
	}

	let {
		content = '',
		name = 'body',
		placeholder = 'Start writing...',
		onWordCount,
		class: className = ''
	}: Props = $props();

	let editorEl: HTMLDivElement;
	let editor = $state<Editor | null>(null);
	let htmlValue = $state(untrack(() => content));

	// Sync editor content when the prop changes externally (e.g. navigating between articles)
	$effect(() => {
		if (editor && !editor.isDestroyed && content !== untrack(() => htmlValue)) {
			editor.commands.setContent(content, false);
			htmlValue = content;
		}
	});

	// Derived word count from character count extension
	let wordCount = $derived(
		htmlValue
			.replace(/<[^>]+>/g, ' ')
			.trim()
			.split(/\s+/)
			.filter(Boolean).length
	);

	$effect(() => {
		if (onWordCount) onWordCount(wordCount);
	});

	onMount(() => {
		editor = new Editor({
			element: editorEl,
			extensions: [
				StarterKit,
				Placeholder.configure({ placeholder }),
				CharacterCount
			],
			content,
			editorProps: {
				attributes: {
					class: 'tiptap-editor-content'
				}
			},
			onUpdate({ editor: e }) {
				htmlValue = e.getHTML();
			}
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});

	function execCommand(command: string, value?: string) {
		if (!editor) return;
		const chain = editor.chain().focus();
		switch (command) {
			case 'bold': chain.toggleBold().run(); break;
			case 'italic': chain.toggleItalic().run(); break;
			case 'strike': chain.toggleStrike().run(); break;
			case 'h2': chain.toggleHeading({ level: 2 }).run(); break;
			case 'h3': chain.toggleHeading({ level: 3 }).run(); break;
			case 'bulletList': chain.toggleBulletList().run(); break;
			case 'orderedList': chain.toggleOrderedList().run(); break;
			case 'blockquote': chain.toggleBlockquote().run(); break;
			case 'codeBlock': chain.toggleCodeBlock().run(); break;
			case 'undo': chain.undo().run(); break;
			case 'redo': chain.redo().run(); break;
		}
	}

	function isActive(type: string, attrs?: Record<string, unknown>) {
		return editor?.isActive(type, attrs) ?? false;
	}
</script>

<!-- Hidden input carries the HTML value for form submission -->
<input type="hidden" {name} value={htmlValue} />

<div class="rte-wrapper {className}">
	<!-- Toolbar -->
	<div class="rte-toolbar">
		<div class="rte-toolbar-group">
			<button
				type="button"
				class="rte-btn"
				class:active={editor && isActive('bold')}
				onclick={() => execCommand('bold')}
				title="Bold (Ctrl+B)"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
			</button>
			<button
				type="button"
				class="rte-btn"
				class:active={editor && isActive('italic')}
				onclick={() => execCommand('italic')}
				title="Italic (Ctrl+I)"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
			</button>
			<button
				type="button"
				class="rte-btn"
				class:active={editor && isActive('strike')}
				onclick={() => execCommand('strike')}
				title="Strikethrough"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/></svg>
			</button>
		</div>

		<div class="rte-toolbar-sep"></div>

		<div class="rte-toolbar-group">
			<button
				type="button"
				class="rte-btn rte-btn--text"
				class:active={editor && isActive('heading', { level: 2 })}
				onclick={() => execCommand('h2')}
				title="Heading 2"
			>H2</button>
			<button
				type="button"
				class="rte-btn rte-btn--text"
				class:active={editor && isActive('heading', { level: 3 })}
				onclick={() => execCommand('h3')}
				title="Heading 3"
			>H3</button>
		</div>

		<div class="rte-toolbar-sep"></div>

		<div class="rte-toolbar-group">
			<button
				type="button"
				class="rte-btn"
				class:active={editor && isActive('bulletList')}
				onclick={() => execCommand('bulletList')}
				title="Bullet list"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
			</button>
			<button
				type="button"
				class="rte-btn"
				class:active={editor && isActive('orderedList')}
				onclick={() => execCommand('orderedList')}
				title="Ordered list"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
			</button>
			<button
				type="button"
				class="rte-btn"
				class:active={editor && isActive('blockquote')}
				onclick={() => execCommand('blockquote')}
				title="Blockquote"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
			</button>
		</div>

		<div class="rte-toolbar-sep"></div>

		<div class="rte-toolbar-group">
			<button
				type="button"
				class="rte-btn"
				onclick={() => execCommand('undo')}
				title="Undo (Ctrl+Z)"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
			</button>
			<button
				type="button"
				class="rte-btn"
				onclick={() => execCommand('redo')}
				title="Redo (Ctrl+Y)"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
			</button>
		</div>

		{#if wordCount > 0}
			<div class="rte-word-count">{wordCount} words</div>
		{/if}
	</div>

	<!-- Editor content area -->
	<div class="rte-content-wrap">
		<div bind:this={editorEl}></div>
	</div>
</div>

<style>
	.rte-wrapper {
		display: flex;
		flex-direction: column;
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		overflow: hidden;
		background: hsl(var(--background));
	}

	.rte-toolbar {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.375rem 0.5rem;
		border-bottom: 1px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.3);
		flex-wrap: wrap;
	}

	.rte-toolbar-group {
		display: flex;
		gap: 0.125rem;
	}

	.rte-toolbar-sep {
		width: 1px;
		height: 1.25rem;
		background: hsl(var(--border));
		margin: 0 0.25rem;
	}

	.rte-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.25rem;
		border: none;
		background: transparent;
		cursor: pointer;
		color: hsl(var(--muted-foreground));
		transition: background 0.1s, color 0.1s;
	}

	.rte-btn--text {
		width: auto;
		padding: 0 0.3rem;
		font-size: 0.75rem;
		font-weight: 700;
	}

	.rte-btn:hover {
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
	}

	.rte-btn.active {
		background: hsl(var(--accent));
		color: hsl(var(--accent-foreground));
	}

	.rte-word-count {
		margin-left: auto;
		font-size: 0.6875rem;
		color: hsl(var(--muted-foreground));
		padding-right: 0.25rem;
	}

	.rte-content-wrap {
		flex: 1;
		min-height: 300px;
		overflow-y: auto;
	}

	:global(.tiptap-editor-content) {
		min-height: 300px;
		padding: 1rem 1.25rem;
		outline: none;
		font-size: 0.9375rem;
		line-height: 1.7;
		color: hsl(var(--foreground));
	}

	:global(.tiptap-editor-content p) {
		margin: 0 0 0.75em;
	}

	:global(.tiptap-editor-content h2) {
		font-size: 1.375rem;
		font-weight: 700;
		margin: 1.25em 0 0.5em;
		line-height: 1.3;
	}

	:global(.tiptap-editor-content h3) {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 1em 0 0.4em;
	}

	:global(.tiptap-editor-content ul),
	:global(.tiptap-editor-content ol) {
		padding-left: 1.5em;
		margin: 0.5em 0;
	}

	:global(.tiptap-editor-content li) {
		margin: 0.25em 0;
	}

	:global(.tiptap-editor-content blockquote) {
		border-left: 3px solid hsl(var(--border));
		padding-left: 1em;
		color: hsl(var(--muted-foreground));
		margin: 0.75em 0;
		font-style: italic;
	}

	:global(.tiptap-editor-content code) {
		background: hsl(var(--muted));
		border-radius: 0.25rem;
		padding: 0.1em 0.3em;
		font-size: 0.875em;
	}

	:global(.tiptap-editor-content pre) {
		background: hsl(var(--muted));
		border-radius: 0.375rem;
		padding: 0.75em 1em;
		margin: 0.75em 0;
		overflow-x: auto;
	}

	:global(.tiptap-editor-content pre code) {
		background: none;
		padding: 0;
	}

	:global(.tiptap-editor-content .is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: hsl(var(--muted-foreground));
		pointer-events: none;
		height: 0;
	}
</style>
