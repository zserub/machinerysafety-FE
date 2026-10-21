<script lang="ts">
	import type { EntryHistoryItem } from "$lib/types/entry";
	import * as m from "$lib/paraglide/messages";

	interface Props {
		history: EntryHistoryItem[];
		maxItems?: number;
	}

	let { history, maxItems = 5 }: Props = $props();

	function formatDate(timestamp: string): string {
		const date = new Date(timestamp);
		return date.toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
		});
	}

	function formatTime(timestamp: string): string {
		const date = new Date(timestamp);
		return date.toLocaleTimeString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function getActionLabel(action: string): string {
		const actionTranslations: Record<string, () => string> = {
			created: () => m.history_created(),
			assigned: () => m.history_assigned(),
			postponed: () => m.history_postponed(),
			moved_up: () => m.history_movedUp(),
			resolved: () => m.history_resolved(),
			rejected: () => m.history_rejected(),
			reopened: () => m.history_reopened(),
			updated: () => m.history_updated(),
			commented: () => m.history_commented(),
		};
		return (
			actionTranslations[action]?.() ??
			action.charAt(0).toUpperCase() + action.slice(1)
		);
	}

	let displayedHistory = $derived(history.slice(0, maxItems));
	let hasMore = $derived(history.length > maxItems);
</script>

<div class="space-y-3">
	{#if displayedHistory.length > 0}
		<div class="relative">
			<!-- Timeline line -->
			<div
				class="absolute left-[7px] top-2 bottom-2 w-[2px] bg-border"
			></div>

			<div class="space-y-4">
				{#each displayedHistory as item (item.id)}
					<div class="flex gap-3">
						<!-- Timeline dot -->
						<div
							class="relative z-10 w-4 h-4 rounded-full bg-primary border-2 border-bg-light flex-shrink-0 mt-0.5"
						></div>

						<!-- Content -->
						<div class="flex-1 min-w-0">
							<div class="flex items-baseline gap-2 text-xs">
								<span class="font-mono text-text-muted">
									{formatDate(item.timestamp)}
								</span>
								<span class="font-mono text-text-muted">
									{formatTime(item.timestamp)}
								</span>
							</div>
							<div class="mt-0.5">
								<span class="font-medium text-primary text-sm">
									{item.user}
								</span>
								<span class="text-text-muted text-sm">
									{getActionLabel(item.action)}
								</span>
							</div>
							{#if item.details}
								<p class="text-text-muted text-xs mt-1 italic">
									{item.details}
								</p>
							{/if}
							{#if item.reason}
								<p class="text-text text-xs mt-1 px-2 py-1 bg-bg rounded border-l-2 border-primary">
									<span class="text-text-muted">{m.history_reasonLabel()}:</span>
									&ldquo;{item.reason}&rdquo;
								</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>

		{#if hasMore}
			<p class="text-xs text-text-muted text-center pt-2">
				{m.history_andMore({ count: history.length - maxItems })}
			</p>
		{/if}
	{:else}
		<p class="text-sm text-text-muted text-center py-4">
			{m.history_noActivity()}
		</p>
	{/if}
</div>
