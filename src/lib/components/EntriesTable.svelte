<script lang="ts">
	import * as Table from "$lib/components/ui/table";
	import { Badge } from "$lib/components/ui/badge";
	import { columnsStore } from "$lib/stores/columns.svelte";
	import { filtersStore } from "$lib/stores/filters.svelte";
	import { metadataStore } from "$lib/stores/metadata.svelte";
	import { entryEditStore } from "$lib/stores/entryEdit.svelte";
	import * as m from "$lib/paraglide/messages";
	import ColumnSelector from "./ColumnSelector.svelte";
	import FilterSelector from "./FilterSelector.svelte";
	import ChevronUp from "lucide-svelte/icons/chevron-up";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import type { Entry } from "$lib/types/entry";

	interface Props {
		entries: Entry[];
		title?: string;
	}

	let { entries, title }: Props = $props();

	let displayTitle = $derived(title ?? m.pages_myEntries());

	// Exclude "responsible" column from My Entries (it's the user's own entries)
	let visibleColumns = $derived(
		columnsStore.visibleColumns.filter((col) => col.key !== "responsible")
	);

	// Sorting state
	type SortDirection = "asc" | "desc" | null;
	let sortColumn = $state<keyof Entry | null>(null);
	let sortDirection = $state<SortDirection>(null);

	function handleSort(columnKey: keyof Entry) {
		if (sortColumn === columnKey) {
			// Cycle: asc -> desc -> null
			if (sortDirection === "asc") {
				sortDirection = "desc";
			} else if (sortDirection === "desc") {
				sortDirection = null;
				sortColumn = null;
			} else {
				sortDirection = "asc";
			}
		} else {
			sortColumn = columnKey;
			sortDirection = "asc";
		}
	}

	// Apply filters to entries
	let filteredEntries = $derived.by(() => {
		let result = entries;

		// Filter by risk levels
		if (filtersStore.filters.riskLevels.length > 0) {
			result = result.filter((entry) =>
				filtersStore.filters.riskLevels.includes(entry.riskLevel)
			);
		}

		// Filter by statuses
		if (filtersStore.filters.statuses.length > 0) {
			result = result.filter((entry) =>
				filtersStore.filters.statuses.includes(entry.status)
			);
		}

		// Filter by deadline range
		if (filtersStore.filters.deadlineRange.from) {
			const fromDate = new Date(filtersStore.filters.deadlineRange.from);
			result = result.filter((entry) => new Date(entry.deadline) >= fromDate);
		}
		if (filtersStore.filters.deadlineRange.to) {
			const toDate = new Date(filtersStore.filters.deadlineRange.to);
			toDate.setHours(23, 59, 59, 999); // Include the entire day
			result = result.filter((entry) => new Date(entry.deadline) <= toDate);
		}

		// Filter by created date range
		if (filtersStore.filters.createdRange.from) {
			const fromDate = new Date(filtersStore.filters.createdRange.from);
			result = result.filter((entry) => new Date(entry.createdAt) >= fromDate);
		}
		if (filtersStore.filters.createdRange.to) {
			const toDate = new Date(filtersStore.filters.createdRange.to);
			toDate.setHours(23, 59, 59, 999); // Include the entire day
			result = result.filter((entry) => new Date(entry.createdAt) <= toDate);
		}

		// Filter by updated date range
		if (filtersStore.filters.updatedRange.from) {
			const fromDate = new Date(filtersStore.filters.updatedRange.from);
			result = result.filter((entry) => new Date(entry.updatedAt) >= fromDate);
		}
		if (filtersStore.filters.updatedRange.to) {
			const toDate = new Date(filtersStore.filters.updatedRange.to);
			toDate.setHours(23, 59, 59, 999); // Include the entire day
			result = result.filter((entry) => new Date(entry.updatedAt) <= toDate);
		}

		// Apply sorting
		if (sortColumn && sortDirection) {
			result = [...result].sort((a, b) => {
				const aVal = a[sortColumn!];
				const bVal = b[sortColumn!];

				// Handle null/undefined values
				if (aVal == null && bVal == null) return 0;
				if (aVal == null) return sortDirection === "asc" ? 1 : -1;
				if (bVal == null) return sortDirection === "asc" ? -1 : 1;

				// Compare based on type
				let comparison = 0;
				if (typeof aVal === "number" && typeof bVal === "number") {
					comparison = aVal - bVal;
				} else if (sortColumn === "deadline" || sortColumn === "createdAt" || sortColumn === "updatedAt" || sortColumn === "implementationDate") {
					// Date comparison; empty/invalid date strings produce NaN — treat them like nulls
					const aTime = new Date(aVal as string).getTime();
					const bTime = new Date(bVal as string).getTime();
					if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
					if (Number.isNaN(aTime)) return sortDirection === "asc" ? 1 : -1;
					if (Number.isNaN(bTime)) return sortDirection === "asc" ? -1 : 1;
					comparison = aTime - bTime;
				} else if (sortColumn === "id") {
					comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
				} else {
					// String comparison
					comparison = String(aVal).localeCompare(String(bVal));
				}

				return sortDirection === "asc" ? comparison : -comparison;
			});
		}

		return result;
	});

	type BadgeVariant = "destructive" | "warning" | "info" | "success" | "default" | "secondary" | "outline";

	function getRiskLevelVariant(riskLevel: string): BadgeVariant {
		return metadataStore.getRiskLevelBadgeVariant(riskLevel) as BadgeVariant;
	}

	function getStatusVariant(status: string): BadgeVariant {
		return metadataStore.getStatusBadgeVariant(status) as BadgeVariant;
	}

	function formatCellValue(entry: Entry, key: keyof Entry): string {
		const value = entry[key];
		if (key === "cost" && typeof value === "number") {
			return new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "EUR",
			}).format(value);
		}
		if (value === null || value === undefined) {
			return "-";
		}
		// Format date columns
		if (key === "deadline" || key === "createdAt" || key === "updatedAt") {
			return formatDate(value as string);
		}
		return String(value);
	}

	function isColumnVisible(key: string): boolean {
		return visibleColumns.some((col) => col.key === key);
	}

	// Translate column labels
	function getColumnLabel(key: keyof Entry): string {
		const translations: Partial<Record<keyof Entry, () => string>> = {
			id: () => m.columns_id(),
			machine: () => m.columns_machine(),
			line: () => m.columns_line(),
			descriptionOfDanger: () => m.columns_descriptionOfDanger(),
			riskLevel: () => m.columns_riskLevel(),
			riskType: () => m.columns_riskType(),
			action: () => m.columns_action(),
			deadline: () => m.columns_deadline(),
			implementationDate: () => m.columns_implementationDate(),
			status: () => m.columns_status(),
			responsible: () => m.columns_responsible(),
			moc: () => m.columns_moc(),
			createdAt: () => m.columns_createdAt(),
			updatedAt: () => m.columns_updatedAt(),
			cost: () => m.columns_cost(),
			expenseType: () => m.columns_expenseType(),
		};
		return translations[key]?.() ?? key;
	}

	function formatRiskType(riskType: number): string {
		return riskType === 1 ? m.riskType_shortTerm() : m.riskType_longTerm();
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return "-";
		return new Date(dateStr).toLocaleDateString();
	}
</script>

<div>
	<div class="flex items-center justify-between mb-4">
		<h2 class="text-text text-2xl">
			{displayTitle}
			{#if filtersStore.hasActiveFilters}
				<span class="text-sm font-normal text-text-muted ml-2">
					({filteredEntries.length} of {entries.length})
				</span>
			{/if}
		</h2>
		<div class="flex items-center gap-2">
			<FilterSelector />
			<ColumnSelector excludeColumns={["responsible"]} />
		</div>
	</div>

	<div class="bg-bg-light border-2 border-border-muted">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					{#each visibleColumns as column (column.key)}
						<Table.Head>
							<button
								onclick={() => handleSort(column.key)}
								class="flex items-center gap-1 hover:text-primary transition-colors w-full text-left"
							>
								{getColumnLabel(column.key)}
								{#if sortColumn === column.key}
									{#if sortDirection === "asc"}
										<ChevronUp class="w-4 h-4 text-primary" />
									{:else if sortDirection === "desc"}
										<ChevronDown class="w-4 h-4 text-primary" />
									{/if}
								{:else}
									<ChevronsUpDown class="w-4 h-4 opacity-30" />
								{/if}
							</button>
						</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each filteredEntries as entry, index (entry.id)}
					<Table.Row
						class="cursor-pointer hover:bg-primary/5 transition-colors {index % 2 === 0 ? 'bg-bg-light' : 'bg-bg'}"
						onclick={() => entryEditStore.open(entry)}
					>
						{#each visibleColumns as column (column.key)}
							<Table.Cell>
								{#if column.key === "riskLevel"}
									<Badge variant={getRiskLevelVariant(entry.riskLevel)}>
										{metadataStore.getRiskLevelLabel(entry.riskLevel)}
									</Badge>
								{:else if column.key === "status"}
									<Badge variant={getStatusVariant(entry.status)}>
										{metadataStore.getStatusLabel(entry.status)}
									</Badge>
								{:else if column.key === "riskType"}
									<Badge variant="secondary">
										{formatRiskType(entry.riskType)}
									</Badge>
								{:else if column.key === "expenseType"}
									{metadataStore.getExpenseTypeLabel(entry.expenseType) || "-"}
								{:else if column.key === "implementationDate"}
									{formatDate(entry.implementationDate)}
								{:else if column.key === "descriptionOfDanger"}
									<span class="max-w-xs truncate block" title={entry.descriptionOfDanger}>
										{entry.descriptionOfDanger}
									</span>
								{:else}
									{formatCellValue(entry, column.key)}
								{/if}
							</Table.Cell>
						{/each}
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
