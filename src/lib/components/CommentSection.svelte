<script lang="ts">
	import * as m from "$lib/paraglide/messages";
	import { Button } from "$lib/components/ui/button";
	import type { EntryComment } from "$lib/types/entry";
	import { entriesApi } from "$lib/api/entries";
	import { userStore } from "$lib/stores/user.svelte";
	import { uiLogger } from "$lib/utils/logger";
	import MessageSquare from "lucide-svelte/icons/message-square";
	import Send from "lucide-svelte/icons/send";
	import Loader2 from "lucide-svelte/icons/loader-2";

	interface Props {
		entryId: string;
		disabled?: boolean;
	}

	let { entryId, disabled = false }: Props = $props();

	const MAX_LENGTH = 500;

	let comments = $state<EntryComment[]>([]);
	let newComment = $state("");
	let isLoading = $state(true);
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	let charCount = $derived(newComment.length);
	let isOverLimit = $derived(charCount > MAX_LENGTH);
	let canSubmit = $derived(newComment.trim().length > 0 && !isOverLimit && !isSubmitting && !disabled);

	// Load comments on mount
	$effect(() => {
		if (entryId) {
			loadComments();
		}
	});

	async function loadComments() {
		isLoading = true;
		error = null;
		try {
			comments = await entriesApi.getComments(entryId);
		} catch (e) {
			uiLogger.error("Failed to load comments:", e);
			error = m.comments_loadError();
		} finally {
			isLoading = false;
		}
	}

	async function handleSubmit() {
		if (!canSubmit) return;

		isSubmitting = true;
		error = null;
		try {
			const comment = await entriesApi.addComment(entryId, newComment.trim());
			comments = [...comments, comment];
			newComment = "";
		} catch (e) {
			uiLogger.error("Failed to add comment:", e);
			error = m.comments_addError();
		} finally {
			isSubmitting = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && canSubmit) {
			e.preventDefault();
			handleSubmit();
		}
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function getInitials(name: string): string {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<div class="space-y-4">
	<!-- Comments list -->
	<div class="space-y-3 max-h-[250px] overflow-y-auto">
		{#if isLoading}
			<div class="flex items-center justify-center py-8">
				<Loader2 class="h-6 w-6 animate-spin text-text-muted" />
			</div>
		{:else if comments.length === 0}
			<div class="flex flex-col items-center justify-center py-6 text-text-muted">
				<MessageSquare class="h-8 w-8 mb-2 opacity-50" />
				<p class="text-sm">{m.comments_empty()}</p>
			</div>
		{:else}
			{#each comments as comment (comment.id)}
				<div class="flex gap-3">
					<!-- Avatar -->
					<div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
						{getInitials(comment.authorName)}
					</div>
					<!-- Content -->
					<div class="flex-1 min-w-0">
						<div class="flex items-baseline gap-2">
							<span class="text-sm font-medium text-text">{comment.authorName}</span>
							<span class="text-xs text-text-muted">{formatDate(comment.createdAt)}</span>
						</div>
						<p class="text-sm text-text mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<!-- Error message -->
	{#if error}
		<p class="text-sm text-danger">{error}</p>
	{/if}

	<!-- New comment input -->
	<div class="border-t border-border pt-4">
		<div class="space-y-2">
			<textarea
				bind:value={newComment}
				onkeydown={handleKeydown}
				placeholder={m.comments_placeholder()}
				rows="2"
				disabled={disabled || isSubmitting}
				class="w-full px-3 py-2 bg-bg border rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm
					{isOverLimit ? 'border-danger' : 'border-border'}
					{disabled ? 'opacity-50 cursor-not-allowed' : ''}"
			></textarea>
			<div class="flex items-center justify-between">
				<span class="text-xs {isOverLimit ? 'text-danger' : 'text-text-muted'}">
					{charCount}/{MAX_LENGTH}
				</span>
				<Button
					size="sm"
					onclick={handleSubmit}
					disabled={!canSubmit}
				>
					{#if isSubmitting}
						<Loader2 class="h-4 w-4 animate-spin mr-1" />
					{:else}
						<Send class="h-4 w-4 mr-1" />
					{/if}
					{m.comments_send()}
				</Button>
			</div>
			<p class="text-xs text-text-muted">{m.comments_hint()}</p>
		</div>
	</div>
</div>
