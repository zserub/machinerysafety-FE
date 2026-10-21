<script lang="ts">
	import { filtersStore } from "$lib/stores/filters.svelte";
	import { metadataStore } from "$lib/stores/metadata.svelte";
	import * as m from "$lib/paraglide/messages";
	import Filter from "lucide-svelte/icons/filter";
	import X from "lucide-svelte/icons/x";
	import Check from "lucide-svelte/icons/check";

	let dropdownOpen = $state(false);

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest(".filter-selector")) {
			dropdownOpen = false;
		}
	}

	function isRiskLevelSelected(value: string): boolean {
		return filtersStore.filters.riskLevels.includes(value);
	}

	function isStatusSelected(value: string): boolean {
		return filtersStore.filters.statuses.includes(value);
	}
</script>

<svelte:document onclick={handleClickOutside} />

<div class="filter-selector relative">
	<button
		onclick={() => (dropdownOpen = !dropdownOpen)}
		class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-8 px-3 border-2 border-border bg-transparent hover:bg-bg-light hover:border-highlight transition-all text-text"
	>
		<Filter class="w-4 h-4" />
		{m.filters_filters()}
		{#if filtersStore.hasActiveFilters}
			<span class="ml-1 px-1.5 py-0.5 text-xs bg-primary text-bg-dark rounded-full">
				{filtersStore.activeFilterCount}
			</span>
		{/if}
	</button>

	{#if dropdownOpen}
		<div
			class="absolute top-full right-0 mt-1 w-84 bg-bg-light border-2 border-border rounded-md shadow-md z-50 py-1 max-h-96 overflow-y-auto"
		>
			<!-- Header with Clear All -->
			<div class="flex items-center justify-between px-2 py-1.5">
				<span class="text-sm font-semibold text-text-muted">{m.filters_filters()}</span>
				{#if filtersStore.hasActiveFilters}
					<button
						onclick={() => filtersStore.clearAll()}
						class="text-xs text-danger hover:text-danger/80 transition-colors"
					>
						{m.table_clearAll()}
					</button>
				{/if}
			</div>
			<div class="h-px bg-border-muted my-1"></div>

			<!-- Risk Levels -->
			<div class="px-2 py-1">
				<div class="flex items-center justify-between mb-1">
					<span class="text-xs font-medium text-text-muted uppercase">{m.filters_riskLevel()}</span>
					{#if filtersStore.filters.riskLevels.length > 0}
						<button
							onclick={() => filtersStore.clearRiskLevels()}
							class="text-xs text-text-muted hover:text-text transition-colors"
						>
							<X class="w-3 h-3" />
						</button>
					{/if}
				</div>
				{#each metadataStore.riskLevels as level (level.value)}
					<button
						onclick={() => filtersStore.toggleRiskLevel(level.value)}
						class="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left hover:bg-bg transition-colors rounded"
					>
						<span
							class="w-4 h-4 flex items-center justify-center border border-border rounded-sm {isRiskLevelSelected(level.value)
								? 'bg-primary text-bg-dark border-primary'
								: ''}"
						>
							{#if isRiskLevelSelected(level.value)}
								<Check class="w-3 h-3" />
							{/if}
						</span>
						<span class={metadataStore.getRiskLevelColor(level.value)}>{metadataStore.getRiskLevelLabel(level.value)}</span>
					</button>
				{/each}
			</div>

			<div class="h-px bg-border-muted my-1"></div>

			<!-- Status -->
			<div class="px-2 py-1">
				<div class="flex items-center justify-between mb-1">
					<span class="text-xs font-medium text-text-muted uppercase">{m.filters_status()}</span>
					{#if filtersStore.filters.statuses.length > 0}
						<button
							onclick={() => filtersStore.clearStatuses()}
							class="text-xs text-text-muted hover:text-text transition-colors"
						>
							<X class="w-3 h-3" />
						</button>
					{/if}
				</div>
				{#each metadataStore.statuses as status (status.value)}
					<button
						onclick={() => filtersStore.toggleStatus(status.value)}
						class="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left hover:bg-bg transition-colors rounded"
					>
						<span
							class="w-4 h-4 flex items-center justify-center border border-border rounded-sm {isStatusSelected(status.value)
								? 'bg-primary text-bg-dark border-primary'
								: ''}"
						>
							{#if isStatusSelected(status.value)}
								<Check class="w-3 h-3" />
							{/if}
						</span>
						<span class={metadataStore.getStatusColor(status.value)}>{metadataStore.getStatusLabel(status.value)}</span>
					</button>
				{/each}
			</div>

			<div class="h-px bg-border-muted my-1"></div>

			<!-- Deadline Range -->
			<div class="px-2 py-1">
				<div class="flex items-center justify-between mb-1">
					<span class="text-xs font-medium text-text-muted uppercase">{m.filters_deadline()}</span>
					{#if filtersStore.filters.deadlineRange.from || filtersStore.filters.deadlineRange.to}
						<button
							onclick={() => filtersStore.clearDeadlineRange()}
							class="text-xs text-text-muted hover:text-text transition-colors"
						>
							<X class="w-3 h-3" />
						</button>
					{/if}
				</div>
				<div class="flex gap-2">
					<div class="flex-1">
						<label for="deadline-from" class="text-xs text-text-muted">{m.filters_from()}</label>
						<input
							id="deadline-from"
							type="date"
							value={filtersStore.filters.deadlineRange.from ?? ""}
							onchange={(e) =>
								filtersStore.setDeadlineRange(
									e.currentTarget.value || null,
									filtersStore.filters.deadlineRange.to
								)}
							class="date-input w-full px-2 py-1 text-sm bg-bg border border-border rounded text-text"
						/>
					</div>
					<div class="flex-1">
						<label for="deadline-to" class="text-xs text-text-muted">{m.filters_to()}</label>
						<input
							id="deadline-to"
							type="date"
							value={filtersStore.filters.deadlineRange.to ?? ""}
							onchange={(e) =>
								filtersStore.setDeadlineRange(
									filtersStore.filters.deadlineRange.from,
									e.currentTarget.value || null
								)}
							class="date-input w-full px-2 py-1 text-sm bg-bg border border-border rounded text-text"
						/>
					</div>
				</div>
			</div>

			<div class="h-px bg-border-muted my-1"></div>

			<!-- Created Date Range -->
			<div class="px-2 py-1">
				<div class="flex items-center justify-between mb-1">
					<span class="text-xs font-medium text-text-muted uppercase">{m.filters_created()}</span>
					{#if filtersStore.filters.createdRange.from || filtersStore.filters.createdRange.to}
						<button
							onclick={() => filtersStore.clearCreatedRange()}
							class="text-xs text-text-muted hover:text-text transition-colors"
						>
							<X class="w-3 h-3" />
						</button>
					{/if}
				</div>
				<div class="flex gap-2">
					<div class="flex-1">
						<label for="created-from" class="text-xs text-text-muted">{m.filters_from()}</label>
						<input
							id="created-from"
							type="date"
							value={filtersStore.filters.createdRange.from ?? ""}
							onchange={(e) =>
								filtersStore.setCreatedRange(
									e.currentTarget.value || null,
									filtersStore.filters.createdRange.to
								)}
							class="date-input w-full px-2 py-1 text-sm bg-bg border border-border rounded text-text"
						/>
					</div>
					<div class="flex-1">
						<label for="created-to" class="text-xs text-text-muted">{m.filters_to()}</label>
						<input
							id="created-to"
							type="date"
							value={filtersStore.filters.createdRange.to ?? ""}
							onchange={(e) =>
								filtersStore.setCreatedRange(
									filtersStore.filters.createdRange.from,
									e.currentTarget.value || null
								)}
							class="date-input w-full px-2 py-1 text-sm bg-bg border border-border rounded text-text"
						/>
					</div>
				</div>
			</div>

			<div class="h-px bg-border-muted my-1"></div>

			<!-- Updated Date Range -->
			<div class="px-2 py-1">
				<div class="flex items-center justify-between mb-1">
					<span class="text-xs font-medium text-text-muted uppercase">{m.filters_updated()}</span>
					{#if filtersStore.filters.updatedRange.from || filtersStore.filters.updatedRange.to}
						<button
							onclick={() => filtersStore.clearUpdatedRange()}
							class="text-xs text-text-muted hover:text-text transition-colors"
						>
							<X class="w-3 h-3" />
						</button>
					{/if}
				</div>
				<div class="flex gap-2">
					<div class="flex-1">
						<label for="updated-from" class="text-xs text-text-muted">{m.filters_from()}</label>
						<input
							id="updated-from"
							type="date"
							value={filtersStore.filters.updatedRange.from ?? ""}
							onchange={(e) =>
								filtersStore.setUpdatedRange(
									e.currentTarget.value || null,
									filtersStore.filters.updatedRange.to
								)}
							class="date-input w-full px-2 py-1 text-sm bg-bg border border-border rounded text-text"
						/>
					</div>
					<div class="flex-1">
						<label for="updated-to" class="text-xs text-text-muted">{m.filters_to()}</label>
						<input
							id="updated-to"
							type="date"
							value={filtersStore.filters.updatedRange.to ?? ""}
							onchange={(e) =>
								filtersStore.setUpdatedRange(
									filtersStore.filters.updatedRange.from,
									e.currentTarget.value || null
								)}
							class="date-input w-full px-2 py-1 text-sm bg-bg border border-border rounded text-text"
						/>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Fix calendar icon color to match border color */
	.date-input::-webkit-calendar-picker-indicator {
		filter: invert(0.5);
	}
</style>
