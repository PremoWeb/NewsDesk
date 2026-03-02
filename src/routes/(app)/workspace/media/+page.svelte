<script lang="ts">
	import { enhance } from '$app/forms';
	import PageContainer from '$lib/components/layout/PageContainer.svelte';
	import PageContent from '$lib/components/layout/PageContent.svelte';
	import SidePanel from '$lib/components/layout/SidePanel.svelte';
	import SidePanelContent from '$lib/components/layout/SidePanelContent.svelte';
	import SidePanelHeader from '$lib/components/layout/SidePanelHeader.svelte';
	import Toolbar from '$lib/components/layout/Toolbar.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Asset = (typeof data.assets)[number];

	let showUpload = $state(false);
	let selectedAsset = $state<Asset | null>(null);
	let search = $state('');
	let filterType = $state<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
	let editingMeta = $state(false);


	const typeFilters = [
		{ key: 'all', label: 'All' },
		{ key: 'image', label: 'Images' },
		{ key: 'video', label: 'Videos' },
		{ key: 'audio', label: 'Audio' },
		{ key: 'document', label: 'Documents' },
	] as const;

	let filtered = $derived(
		data.assets.filter((a) => {
			if (search && !a.originalName.toLowerCase().includes(search.toLowerCase()) && !(a.caption ?? '').toLowerCase().includes(search.toLowerCase())) return false;
			if (filterType === 'image' && !a.mimeType.startsWith('image/')) return false;
			if (filterType === 'video' && !a.mimeType.startsWith('video/')) return false;
			if (filterType === 'audio' && !a.mimeType.startsWith('audio/')) return false;
			if (filterType === 'document' && !a.mimeType.includes('pdf')) return false;
			return true;
		})
	);

	function isImage(mimeType: string) {
		return mimeType.startsWith('image/');
	}

	function isVideo(mimeType: string) {
		return mimeType.startsWith('video/');
	}

	function isAudio(mimeType: string) {
		return mimeType.startsWith('audio/');
	}

	function fileIcon(mimeType: string) {
		if (isVideo(mimeType)) return '🎥';
		if (isAudio(mimeType)) return '🎵';
		if (mimeType.includes('pdf')) return '📄';
		return '📎';
	}

	function formatSize(bytes: number) {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	}

	function formatDate(date: Date | string | null) {
		if (!date) return '—';
		return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<PageContainer>
	<PageContent>
		<Toolbar>
			<span class="text-sm font-semibold text-foreground">Media Library</span>
			<div class="subnav-divider"></div>
			<div class="type-filters">
				{#each typeFilters as f (f.key)}
					<button
						class="type-filter-btn"
						class:active={filterType === f.key}
						onclick={() => filterType = f.key}
					>{f.label}</button>
				{/each}
			</div>
			<div class="subnav-search">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
				<input type="search" placeholder="Search media..." class="subnav-search-input" bind:value={search} />
			</div>
			<div class="ml-auto flex items-center gap-2">
				<span class="text-xs text-muted-foreground">{filtered.length} asset{filtered.length !== 1 ? 's' : ''}</span>
				<button class="toolbar-btn toolbar-btn--primary" onclick={() => showUpload = true}>
					<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
					Upload
				</button>
			</div>
		</Toolbar>

		<div class="media-layout">
			<div class="media-grid-wrap">
				{#if filtered.length === 0}
					<div class="empty-state">
						<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
						<p>{data.assets.length === 0 ? 'No media uploaded yet' : 'No media matching your search'}</p>
						{#if data.assets.length === 0}
							<button class="empty-action-btn" onclick={() => showUpload = true}>Upload First File</button>
						{/if}
					</div>
				{:else}
					<div class="media-grid">
						{#each filtered as asset (asset.id)}
							<button
								class="media-card"
								class:selected={selectedAsset?.id === asset.id}
								onclick={() => { selectedAsset = asset; editingMeta = false; }}
							>
								<div class="media-thumb">
									{#if isImage(asset.mimeType)}
										<img src={asset.url} alt={asset.altText || asset.originalName} loading="lazy" />
									{:else}
										<div class="media-thumb-placeholder">
											<span class="media-thumb-icon">{fileIcon(asset.mimeType)}</span>
										</div>
									{/if}
								</div>
								<div class="media-card-info">
									<span class="media-name" title={asset.originalName}>{asset.originalName}</span>
									<span class="media-size">{formatSize(asset.size)}</span>
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			{#if selectedAsset}
				<SidePanel width={300}>
					<SidePanelHeader>
						<span class="preview-label">Asset Details</span>
						<button class="panel-close" onclick={() => selectedAsset = null} aria-label="Close">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
						</button>
					</SidePanelHeader>
					<SidePanelContent>
						<div class="asset-detail">
							{#if isImage(selectedAsset.mimeType)}
								<div class="asset-preview-img">
									<img src={selectedAsset.url} alt={selectedAsset.altText || selectedAsset.originalName} />
								</div>
							{:else}
								<div class="asset-preview-placeholder">
									<span>{fileIcon(selectedAsset.mimeType)}</span>
								</div>
							{/if}

							<div class="asset-meta-list">
								<div class="meta-row"><span class="meta-key">File</span><span class="meta-val" title={selectedAsset.originalName}>{selectedAsset.originalName}</span></div>
								<div class="meta-row"><span class="meta-key">Type</span><span class="meta-val">{selectedAsset.mimeType}</span></div>
								<div class="meta-row"><span class="meta-key">Size</span><span class="meta-val">{formatSize(selectedAsset.size)}</span></div>
								<div class="meta-row"><span class="meta-key">Uploaded</span><span class="meta-val">{formatDate(selectedAsset.createdAt)}</span></div>
								{#if selectedAsset.uploader?.name}
									<div class="meta-row"><span class="meta-key">By</span><span class="meta-val">{selectedAsset.uploader.name}</span></div>
								{/if}
							</div>

							{#if editingMeta}
								<form method="POST" action="?/updateMeta" class="meta-edit-form" use:enhance={() => async ({ update }) => { await update(); editingMeta = false; }}>
									<input type="hidden" name="id" value={selectedAsset.id} />
									<div class="form-group">
										<label for="meta-caption">Caption</label>
										<input id="meta-caption" name="caption" value={selectedAsset.caption ?? ''} placeholder="Add a caption..." />
									</div>
									<div class="form-group">
										<label for="meta-alt">Alt Text</label>
										<input id="meta-alt" name="altText" value={selectedAsset.altText ?? ''} placeholder="Describe for accessibility..." />
									</div>
									<div class="form-group">
										<label for="meta-credit">Credit</label>
										<input id="meta-credit" name="credit" value={selectedAsset.credit ?? ''} placeholder="Photographer / source..." />
									</div>
									<div class="meta-edit-actions">
										<button type="button" class="btn-cancel" onclick={() => editingMeta = false}>Cancel</button>
										<button type="submit" class="btn-submit">Save</button>
									</div>
								</form>
							{:else}
								{#if selectedAsset.caption}
									<p class="asset-caption">"{selectedAsset.caption}"</p>
								{/if}
								{#if selectedAsset.credit}
									<p class="asset-credit">Credit: {selectedAsset.credit}</p>
								{/if}
							{/if}

							<div class="asset-actions">
								<a href={selectedAsset.url} target="_blank" class="asset-action-btn">
									<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
									Open
								</a>
								<button class="asset-action-btn" onclick={() => editingMeta = !editingMeta}>
									<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
									Edit Info
								</button>
								<form method="POST" action="?/delete" use:enhance={() => async ({ update }) => { await update(); selectedAsset = null; }}>
									<input type="hidden" name="id" value={selectedAsset.id} />
				<button class="asset-action-btn asset-action-btn--danger" aria-label="Delete asset">
										<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
										Delete
									</button>
								</form>
							</div>
						</div>
					</SidePanelContent>
				</SidePanel>
			{/if}
		</div>
	</PageContent>
</PageContainer>

<!-- Upload Modal -->
{#if showUpload}
	<div class="modal-backdrop" onclick={() => showUpload = false} role="presentation" aria-hidden="true"></div>
	<div class="modal" role="dialog" aria-label="Upload Media" aria-modal="true">
		<div class="modal-header">
			<span class="modal-title">Upload Media</span>
		<button class="modal-close" aria-label="Close" onclick={() => showUpload = false}>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
			</button>
		</div>
		<form method="POST" action="?/upload" enctype="multipart/form-data" class="modal-form" use:enhance={() => async ({ update }) => { await update(); showUpload = false; }}>
			<div class="upload-drop-zone">
				<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
				<label for="upload-file" class="upload-label">
					<span>Choose a file</span>
					<span class="upload-hint">Images, video, audio, PDF — up to 50MB</span>
				</label>
				<input id="upload-file" name="file" type="file" accept="image/*,video/mp4,video/webm,audio/mpeg,audio/wav,application/pdf" required />
			</div>
			<div class="form-group">
				<label for="upload-caption">Caption</label>
				<input id="upload-caption" name="caption" placeholder="Optional caption..." />
			</div>
			<div class="form-row">
				<div class="form-group">
					<label for="upload-alt">Alt Text</label>
					<input id="upload-alt" name="altText" placeholder="Describe the image..." />
				</div>
				<div class="form-group">
					<label for="upload-credit">Credit</label>
					<input id="upload-credit" name="credit" placeholder="Photographer..." />
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn-cancel" onclick={() => showUpload = false}>Cancel</button>
				<button type="submit" class="btn-submit">Upload</button>
			</div>
		</form>
	</div>
{/if}

<style>
	.media-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.media-grid-wrap {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 80px 20px;
		color: var(--color-muted-foreground, #6b7280);
		text-align: center;
	}

	.empty-state p {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-foreground, #111827);
	}

	.empty-action-btn {
		margin-top: 8px;
		padding: 8px 16px;
		background: var(--color-primary, #3b82f6);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
	}

	.media-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 10px;
	}

	.media-card {
		display: flex;
		flex-direction: column;
		border: 2px solid transparent;
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		background: var(--color-card, #fff);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		transition: all 0.1s;
		text-align: left;
	}

	.media-card:hover {
		border-color: var(--color-primary, #3b82f6);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
	}

	.media-card.selected {
		border-color: var(--color-primary, #3b82f6);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
	}

	.media-thumb {
		width: 100%;
		aspect-ratio: 4/3;
		background: var(--color-accent, #f3f4f6);
		overflow: hidden;
	}

	.media-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.media-thumb-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.media-thumb-icon {
		font-size: 2rem;
	}

	.media-card-info {
		padding: 6px 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.media-name {
		font-size: 0.7rem;
		font-weight: 500;
		color: var(--color-foreground, #111827);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.media-size {
		font-size: 0.65rem;
		color: var(--color-muted-foreground, #6b7280);
	}

	/* Type filters */
	.type-filters {
		display: flex;
		gap: 2px;
	}

	.type-filter-btn {
		padding: 3px 8px;
		border-radius: 4px;
		font-size: 0.75rem;
		border: 1px solid transparent;
		background: transparent;
		color: var(--color-muted-foreground, #6b7280);
		cursor: pointer;
		transition: all 0.1s;
	}

	.type-filter-btn:hover {
		background: var(--color-accent, #f3f4f6);
		color: var(--color-foreground, #111827);
	}

	.type-filter-btn.active {
		background: var(--color-primary, #3b82f6);
		color: white;
	}

	/* Toolbar */
	.toolbar-btn {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 5px 10px;
		border-radius: 5px;
		font-size: 0.75rem;
		font-weight: 500;
		border: 1px solid var(--color-border, #e5e7eb);
		background: var(--color-card, #fff);
		color: var(--color-foreground, #111827);
		cursor: pointer;
		transition: all 0.1s;
	}

	.toolbar-btn--primary {
		background: var(--color-primary, #3b82f6);
		color: white;
		border-color: var(--color-primary, #3b82f6);
	}

	.toolbar-btn--primary:hover {
		background: #2563eb;
	}

	/* Side panel */
	.preview-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-muted-foreground, #6b7280);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.panel-close {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-muted-foreground, #6b7280);
		padding: 4px;
		border-radius: 4px;
		margin-left: auto;
	}

	.panel-close:hover {
		background: var(--color-accent, #f3f4f6);
	}

	.asset-detail {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.asset-preview-img {
		border-radius: 6px;
		overflow: hidden;
		background: var(--color-accent, #f3f4f6);
	}

	.asset-preview-img img {
		width: 100%;
		height: auto;
		display: block;
		max-height: 200px;
		object-fit: contain;
	}

	.asset-preview-placeholder {
		height: 120px;
		background: var(--color-accent, #f3f4f6);
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
	}

	.asset-meta-list {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.meta-row {
		display: flex;
		justify-content: space-between;
		gap: 8px;
	}

	.meta-key {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--color-muted-foreground, #6b7280);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	.meta-val {
		font-size: 0.75rem;
		color: var(--color-foreground, #111827);
		text-align: right;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.asset-caption,
	.asset-credit {
		font-size: 0.75rem;
		color: var(--color-muted-foreground, #6b7280);
		font-style: italic;
	}

	.meta-edit-form {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.form-group label {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--color-foreground, #111827);
	}

	.form-group input {
		padding: 6px 8px;
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 5px;
		font-size: 0.75rem;
		background: var(--color-background, #fff);
		color: var(--color-foreground, #111827);
		outline: none;
	}

	.form-group input:focus {
		border-color: var(--color-primary, #3b82f6);
	}

	.meta-edit-actions {
		display: flex;
		gap: 6px;
		justify-content: flex-end;
	}

	.asset-actions {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.asset-action-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 7px 10px;
		border-radius: 5px;
		font-size: 0.75rem;
		font-weight: 500;
		border: 1px solid var(--color-border, #e5e7eb);
		background: var(--color-card, #fff);
		color: var(--color-foreground, #111827);
		cursor: pointer;
		text-decoration: none;
		transition: all 0.1s;
	}

	.asset-action-btn:hover {
		background: var(--color-accent, #f3f4f6);
	}

	.asset-action-btn--danger {
		color: #dc2626;
	}

	.asset-action-btn--danger:hover {
		background: #fef2f2;
		border-color: #fecaca;
	}

	/* Modal */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 50;
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 51;
		background: var(--color-card, #fff);
		border-radius: 10px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
		width: 500px;
		max-width: calc(100vw - 32px);
		max-height: calc(100vh - 64px);
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid var(--color-border, #e5e7eb);
	}

	.modal-title {
		font-size: 0.95rem;
		font-weight: 600;
		flex: 1;
		color: var(--color-foreground, #111827);
	}

	.modal-close {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-muted-foreground, #6b7280);
		padding: 4px;
		border-radius: 4px;
	}

	.modal-form {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.modal-form .form-group label {
		font-size: 0.75rem;
		font-weight: 600;
	}

	.modal-form .form-group input {
		padding: 8px 10px;
		font-size: 0.8rem;
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 6px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.upload-drop-zone {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 32px;
		border: 2px dashed var(--color-border, #e5e7eb);
		border-radius: 8px;
		background: var(--color-accent, #f9fafb);
		color: var(--color-muted-foreground, #6b7280);
		cursor: pointer;
	}

	.upload-label {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		cursor: pointer;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-primary, #3b82f6);
	}

	.upload-hint {
		font-size: 0.7rem;
		color: var(--color-muted-foreground, #6b7280);
		font-weight: 400;
	}

	#upload-file {
		margin-top: 4px;
		font-size: 0.75rem;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}

	.btn-cancel,
	.btn-submit {
		padding: 8px 16px;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid var(--color-border, #e5e7eb);
		transition: all 0.1s;
	}

	.btn-cancel {
		background: var(--color-card, #fff);
		color: var(--color-foreground, #111827);
	}

	.btn-cancel:hover {
		background: var(--color-accent, #f3f4f6);
	}

	.btn-submit {
		background: var(--color-primary, #3b82f6);
		color: white;
		border-color: var(--color-primary, #3b82f6);
	}

	.btn-submit:hover {
		background: #2563eb;
	}

	/* Toolbar shared */
	:global(.subnav-divider) {
		width: 1px;
		height: 16px;
		background: var(--color-border, #e5e7eb);
	}

	:global(.subnav-search) {
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--color-muted-foreground, #6b7280);
	}

	:global(.subnav-search-input) {
		background: none;
		border: none;
		outline: none;
		font-size: 0.8rem;
		color: var(--color-foreground, #111827);
		width: 160px;
	}
</style>
