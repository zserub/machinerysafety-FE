<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import * as m from "$lib/paraglide/messages";
	import { Button } from "$lib/components/ui/button";
	import { entriesApi } from "$lib/api/entries";
	import { toastStore } from "$lib/stores/toast.svelte";
	import { uiLogger } from "$lib/utils/logger";
	import type { Entry } from "$lib/types/entry";

	const MIN_REASON_LENGTH = 10;

	interface Props {
		open: boolean;
		entryId: string;
		currentDeadline: string;
		onClose: () => void;
		onSuccess: (updated: Entry) => void;
	}

	let { open, entryId, currentDeadline, onClose, onSuccess }: Props = $props();

	let newDeadline = $state(currentDeadline);
	let reason = $state("");
	let isSaving = $state(false);

	let isFirstTimeSet = $derived(!currentDeadline);
	let reasonRequired = $derived(!isFirstTimeSet);
	let reasonTooShort = $derived(
		reasonRequired && reason.trim().length < MIN_REASON_LENGTH
	);
	let unchanged = $derived(!newDeadline || newDeadline === currentDeadline);
	let canSubmit = $derived(!isSaving && !unchanged && !reasonTooShort);

	$effect(() => {
		if (open) {
			newDeadline = currentDeadline;
			reason = "";
			isSaving = false;
		}
	});

	function handleOpenChange(value: boolean) {
		if (!value && !isSaving) onClose();
	}

	async function handleSubmit() {
		if (!canSubmit) return;
		isSaving = true;
		try {
			const updated = await entriesApi.changeDeadline(
				entryId,
				newDeadline,
				reasonRequired ? reason.trim() : undefined
			);
			toastStore.success(m.toast_deadlineChanged());
			onSuccess(updated);
			onClose();
		} catch (error) {
			uiLogger.error("Deadline change failed:", error);
			const message =
				error instanceof Error ? error.message : m.toast_deadlineChangeError();
			toastStore.error(message || m.toast_deadlineChangeError());
		} finally {
			isSaving = false;
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>
				{isFirstTimeSet ? m.deadline_setTitle() : m.deadline_changeTitle()}
			</Dialog.Title>
		</Dialog.Header>

		<div class="space-y-4 py-2">
			{#if !isFirstTimeSet}
				<div>
					<label class="block text-sm font-medium text-text-muted mb-1">
						{m.deadline_current()}
					</label>
					<p class="text-sm text-text font-mono">{currentDeadline}</p>
				</div>
			{/if}

			<div>
				<label
					for="deadline-change-date"
					class="block text-sm font-medium text-text-muted mb-1"
				>
					{m.deadline_newDeadline()}
				</label>
				<input
					id="deadline-change-date"
					type="date"
					class="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
					bind:value={newDeadline}
				/>
			</div>

			{#if reasonRequired}
				<div>
					<label
						for="deadline-change-reason"
						class="block text-sm font-medium text-text-muted mb-1"
					>
						{m.deadline_reason()}
					</label>
					<textarea
						id="deadline-change-reason"
						class="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
						rows="3"
						placeholder={m.deadline_reasonPlaceholder()}
						bind:value={reason}
					></textarea>
					{#if reason.length > 0 && reasonTooShort}
						<p class="text-xs text-danger mt-1">
							{m.deadline_reasonTooShort()}
						</p>
					{/if}
				</div>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={onClose} disabled={isSaving}>
				{m.deadline_cancel()}
			</Button>
			<Button onclick={handleSubmit} disabled={!canSubmit}>
				{m.deadline_submit()}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
