<script lang="ts">
	import { filtersStore } from "$lib/stores/filters.svelte";
	import { metadataStore } from "$lib/stores/metadata.svelte";
	import * as m from "$lib/paraglide/messages";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import Check from "lucide-svelte/icons/check";

	let dropdownOpen = $state(false);

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest(".status-filter")) {
			dropdownOpen = false;
		}
	}

	function isSelected(value: string): boolean {
		return filtersStore.filters.statuses.includes(value);
	}

	let selectedCount = $derived(filtersStore.filters.statuses.length);
</script>

<svelte:document onclick={handleClickOutside} />

<div class="status-filter relative">
	<button
		onclick={() => (dropdownOpen = !dropdownOpen)}
		class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-8 px-3 border-2 border-border bg-transparent hover:bg-bg-light hover:border-highlight transition-all text-text"
	>
		{m.filters_status()}
		{#if selectedCount > 0}
			<span class="px-1.5 py-0.5 text-xs bg-primary text-bg-dark rounded-full">
				{selectedCount}
			</span>
		{/if}
		<ChevronDown class="w-4 h-4" />
	</button>

	{#if dropdownOpen}
		<div
			class="absolute top-full left-0 mt-1 w-48 bg-bg-light border-2 border-border rounded-md shadow-md z-50 py-1"
		>
			{#each metadataStore.statuses as status (status.value)}
				<button
					onclick={() => filtersStore.toggleStatus(status.value)}
					class="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left hover:bg-bg transition-colors rounded"
				>
					<span
						class="w-4 h-4 flex items-center justify-center border border-border rounded-sm {isSelected(status.value)
							? 'bg-primary text-bg-dark border-primary'
							: ''}"
					>
						{#if isSelected(status.value)}
							<Check class="w-3 h-3" />
						{/if}
					</span>
					<span class={metadataStore.getStatusColor(status.value)}>{metadataStore.getStatusLabel(status.value)}</span>
				</button>
			{/each}
			{#if selectedCount > 0}
				<div class="h-px bg-border-muted my-1"></div>
				<button
					onclick={() => filtersStore.clearStatuses()}
					class="w-full px-2 py-1.5 text-sm text-left text-danger hover:bg-bg transition-colors"
				>
					{m.filters_clear()}
				</button>
			{/if}
		</div>
	{/if}
</div>
