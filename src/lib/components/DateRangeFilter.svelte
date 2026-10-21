<script lang="ts">
	import { filtersStore } from "$lib/stores/filters.svelte";
	import * as m from "$lib/paraglide/messages";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import X from "lucide-svelte/icons/x";

	interface Props {
		label: string;
		type: "deadline" | "created" | "updated";
	}

	let { label, type }: Props = $props();

	let dropdownOpen = $state(false);
	let uniqueClass = `date-filter-${type}`;

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest(`.${uniqueClass}`)) {
			dropdownOpen = false;
		}
	}

	let range = $derived.by(() => {
		if (type === "deadline") return filtersStore.filters.deadlineRange;
		if (type === "created") return filtersStore.filters.createdRange;
		return filtersStore.filters.updatedRange;
	});

	let hasValue = $derived(range.from !== null || range.to !== null);

	function setRange(from: string | null, to: string | null) {
		if (type === "deadline") {
			filtersStore.setDeadlineRange(from, to);
		} else if (type === "created") {
			filtersStore.setCreatedRange(from, to);
		} else {
			filtersStore.setUpdatedRange(from, to);
		}
	}

	function clearRange() {
		if (type === "deadline") {
			filtersStore.clearDeadlineRange();
		} else if (type === "created") {
			filtersStore.clearCreatedRange();
		} else {
			filtersStore.clearUpdatedRange();
		}
	}
</script>

<svelte:document onclick={handleClickOutside} />

<div class="{uniqueClass} relative">
	<button
		onclick={() => (dropdownOpen = !dropdownOpen)}
		class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-8 px-3 border-2 border-border bg-transparent hover:bg-bg-light hover:border-highlight transition-all text-text"
	>
		{label}
		{#if hasValue}
			<span class="w-2 h-2 bg-primary rounded-full"></span>
		{/if}
		<ChevronDown class="w-4 h-4" />
	</button>

	{#if dropdownOpen}
		<div
			class="absolute top-full left-0 mt-1 w-80 bg-bg-light border-2 border-border rounded-md shadow-md z-50 p-2"
		>
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-medium text-text-muted uppercase">{label}</span>
				{#if hasValue}
					<button
						onclick={clearRange}
						class="text-text-muted hover:text-text transition-colors"
					>
						<X class="w-3 h-3" />
					</button>
				{/if}
			</div>
			<div class="flex gap-2">
				<div class="flex-1">
					<label for="{type}-from" class="text-xs text-text-muted">{m.filters_from()}</label>
					<input
						id="{type}-from"
						type="date"
						value={range.from ?? ""}
						onchange={(e) => setRange(e.currentTarget.value || null, range.to)}
						class="date-input w-full px-2 py-1 text-sm bg-bg border border-border rounded text-text"
					/>
				</div>
				<div class="flex-1">
					<label for="{type}-to" class="text-xs text-text-muted">{m.filters_to()}</label>
					<input
						id="{type}-to"
						type="date"
						value={range.to ?? ""}
						onchange={(e) => setRange(range.from, e.currentTarget.value || null)}
						class="date-input w-full px-2 py-1 text-sm bg-bg border border-border rounded text-text"
					/>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.date-input::-webkit-calendar-picker-indicator {
		filter: invert(0.5);
	}
</style>
