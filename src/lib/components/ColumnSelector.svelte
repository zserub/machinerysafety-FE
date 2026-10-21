<script lang="ts">
	import { columnsStore } from "$lib/stores/columns.svelte";
	import * as m from "$lib/paraglide/messages";
	import Columns3 from "lucide-svelte/icons/columns-3";
	import RotateCcw from "lucide-svelte/icons/rotate-ccw";
	import Check from "lucide-svelte/icons/check";
	import type { Entry } from "$lib/types/entry";

	interface Props {
		excludeColumns?: (keyof Entry)[];
	}

	let { excludeColumns = [] }: Props = $props();

	let dropdownOpen = $state(false);

	let filteredColumns = $derived(
		columnsStore.columns.filter((col) => !excludeColumns.includes(col.key))
	);

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest(".column-selector")) {
			dropdownOpen = false;
		}
	}

	// Translate column labels
	function getColumnLabel(key: keyof Entry): string {
		const translations: Partial<Record<keyof Entry, () => string>> = {
			id: () => m.columns_id(),
			machine: () => m.columns_machine(),
			line: () => m.columns_line(),
			descriptionOfDanger: () => m.columns_descriptionOfDanger(),
			riskLevel: () => m.columns_riskLevel(),
			action: () => m.columns_action(),
			deadline: () => m.columns_deadline(),
			status: () => m.columns_status(),
			responsible: () => m.columns_responsible(),
			moc: () => m.columns_moc(),
			createdAt: () => m.columns_createdAt(),
			updatedAt: () => m.columns_updatedAt(),
			cost: () => m.columns_cost(),
		};
		return translations[key]?.() ?? key;
	}
</script>

<svelte:document onclick={handleClickOutside} />

<div class="column-selector relative">
	<button
		onclick={() => (dropdownOpen = !dropdownOpen)}
		class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-8 px-3 border-2 border-border bg-transparent hover:bg-bg-light hover:border-highlight transition-all text-text"
	>
		<Columns3 class="w-4 h-4" />
		{m.table_columns()}
	</button>

	{#if dropdownOpen}
		<div
			class="absolute top-full right-0 mt-1 w-56 bg-bg-light border-2 border-border rounded-md shadow-md z-50 py-1"
		>
			<div class="px-2 py-1.5 text-sm font-semibold text-text-muted">{m.table_toggleColumns()}</div>
			<div class="h-px bg-border-muted my-1"></div>

			{#each filteredColumns as column (column.key)}
				<button
					onclick={() => columnsStore.toggleColumn(column.key)}
					class="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left text-text-muted hover:bg-bg hover:text-primary transition-colors"
				>
					<span
						class="w-4 h-4 flex items-center justify-center border border-border rounded-sm {column.visible
							? 'bg-primary text-bg-dark border-primary'
							: ''}"
					>
						{#if column.visible}
							<Check class="w-3 h-3" />
						{/if}
					</span>
					{getColumnLabel(column.key)}
				</button>
			{/each}

			<div class="h-px bg-border-muted my-1"></div>

			<button
				onclick={() => columnsStore.resetToDefaults()}
				class="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left text-text-muted hover:bg-bg hover:text-primary transition-colors"
			>
				<RotateCcw class="w-4 h-4" />
				{m.table_resetToDefaults()}
			</button>
		</div>
	{/if}
</div>
