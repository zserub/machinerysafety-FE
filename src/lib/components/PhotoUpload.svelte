<script lang="ts">
	import type { EntryPhoto } from "$lib/types/entry";
	import * as m from "$lib/paraglide/messages";
	import { uiLogger } from "$lib/utils/logger";
	import Upload from "lucide-svelte/icons/upload";
	import X from "lucide-svelte/icons/x";
	import ImageIcon from "lucide-svelte/icons/image";

	interface Props {
		photos: EntryPhoto[];
		maxPhotos?: number;
		maxSizeMB?: number;
		onUpload: (file: File) => Promise<void>;
		onRemove: (photoId: string) => Promise<void>;
		disabled?: boolean;
	}

	let {
		photos,
		maxPhotos = 5,
		maxSizeMB = 10,
		onUpload,
		onRemove,
		disabled = false,
	}: Props = $props();

	let isDragging = $state(false);
	let isUploading = $state(false);
	let fileInput: HTMLInputElement;

	const acceptedTypes = ["image/jpeg", "image/png", "image/jpg"];

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (!disabled && photos.length < maxPhotos) {
			isDragging = true;
		}
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		if (disabled || photos.length >= maxPhotos) return;

		const files = e.dataTransfer?.files;
		if (files) {
			await processFiles(Array.from(files));
		}
	}

	function handleClick() {
		if (!disabled && photos.length < maxPhotos) {
			fileInput?.click();
		}
	}

	async function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			await processFiles(Array.from(target.files));
			target.value = "";
		}
	}

	async function processFiles(files: File[]) {
		for (const file of files) {
			if (photos.length >= maxPhotos) break;

			if (!acceptedTypes.includes(file.type)) {
				uiLogger.warn(`Skipping file ${file.name}: invalid type`);
				continue;
			}

			if (file.size > maxSizeMB * 1024 * 1024) {
				uiLogger.warn(`Skipping file ${file.name}: too large`);
				continue;
			}

			isUploading = true;
			try {
				await onUpload(file);
			} catch (error) {
				uiLogger.error("Upload failed:", error);
			}
			isUploading = false;
		}
	}

	async function handleRemove(photoId: string) {
		try {
			await onRemove(photoId);
		} catch (error) {
			uiLogger.error("Remove failed:", error);
		}
	}

	let canUpload = $derived(!disabled && photos.length < maxPhotos);
</script>

<div class="space-y-4">
	<!-- Upload zone -->
	<button
		type="button"
		class="w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors {isDragging
			? 'border-primary bg-primary/5'
			: canUpload
				? 'border-border-muted hover:border-primary hover:bg-bg cursor-pointer'
				: 'border-border-muted bg-bg-dark cursor-not-allowed opacity-50'}"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		onclick={handleClick}
		disabled={!canUpload}
	>
		<input
			bind:this={fileInput}
			type="file"
			accept={acceptedTypes.join(",")}
			multiple
			class="hidden"
			onchange={handleFileChange}
		/>
		<div class="flex flex-col items-center gap-2">
			{#if isUploading}
				<div
					class="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin"
				></div>
				<span class="text-text-muted text-sm">{m.photo_uploading()}</span>
			{:else}
				<Upload class="h-10 w-10 text-text-muted" />
				<span class="text-text-muted text-sm">{m.photo_dropHere()}</span>
				<span class="text-text-muted text-xs">{m.photo_hint()}</span>
			{/if}
		</div>
	</button>

	<!-- Photo grid -->
	{#if photos.length > 0}
		<div class="grid grid-cols-3 gap-3">
			{#each photos as photo (photo.id)}
				<div class="relative group aspect-square rounded-lg overflow-hidden bg-bg border border-border">
					<img
						src={photo.url}
						alt={photo.filename}
						class="w-full h-full object-cover"
					/>
					{#if !disabled}
						<button
							type="button"
							onclick={() => handleRemove(photo.id)}
							class="absolute top-1 right-1 p-1 rounded-full bg-danger text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger/80"
						>
							<X class="h-4 w-4" />
						</button>
					{/if}
					<div
						class="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-xs text-white truncate"
					>
						{photo.filename}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex items-center justify-center gap-2 py-4 text-text-muted">
			<ImageIcon class="h-5 w-5" />
			<span class="text-sm">{m.photo_noPhotos()}</span>
		</div>
	{/if}
</div>
