<script lang="ts">
	import * as Table from "$lib/components/ui/table";
	import { Badge } from "$lib/components/ui/badge";
	import { columnsStore } from "$lib/stores/columns.svelte";
	import { filtersStore } from "$lib/stores/filters.svelte";
	import { metadataStore } from "$lib/stores/metadata.svelte";
	import { entryEditStore } from "$lib/stores/entryEdit.svelte";
	import * as m from "$lib/paraglide/messages";
	import SearchInput from "./SearchInput.svelte";
	import RiskLevelFilter from "./RiskLevelFilter.svelte";
	import StatusFilter from "./StatusFilter.svelte";
	import LineFilter from "./LineFilter.svelte";
	import ResponsibleFilter from "./ResponsibleFilter.svelte";
	import DateRangeFilter from "./DateRangeFilter.svelte";
	import ColumnSelector from "./ColumnSelector.svelte";
	import Pagination from "./Pagination.svelte";
	import ChevronUp from "lucide-svelte/icons/chevron-up";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import Download from "lucide-svelte/icons/download";
	import X from "lucide-svelte/icons/x";
	import { exportToExcel } from "$lib/utils/export";
	import type { Entry } from "$lib/types/entry";

	interface Props {
		entries: Entry[];
		title?: string;
	}

	let { entries, title = "" }: Props = $props();

	// Search state
	let searchQuery = $state("");

	// Pagination state
	let currentPage = $state(1);
	let pageSize = $state(100);

	// Sorting state
	type SortDirection = "asc" | "desc" | null;
	let sortColumn = $state<keyof Entry | null>(null);
	let sortDirection = $state<SortDirection>(null);

	function handleSort(columnKey: keyof Entry) {
		if (sortColumn === columnKey) {
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

	// Extract unique values for filters
	let uniqueLines = $derived([...new Set(entries.map((e) => e.line))]);
	let uniqueResponsibles = $derived([...new Set(entries.map((e) => e.responsible))]);

	// Search function - searches across all text fields
	function matchesSearch(entry: Entry, query: string): boolean {
		if (!query.trim()) return true;
		const lowerQuery = query.toLowerCase();
		return (
			entry.id.toLowerCase().includes(lowerQuery) ||
			entry.machine.toLowerCase().includes(lowerQuery) ||
			entry.line.toLowerCase().includes(lowerQuery) ||
			entry.descriptionOfDanger.toLowerCase().includes(lowerQuery) ||
			entry.action.toLowerCase().includes(lowerQuery) ||
			entry.riskLevel.toLowerCase().includes(lowerQuery) ||
			entry.status.toLowerCase().includes(lowerQuery) ||
			entry.responsible.toLowerCase().includes(lowerQuery) ||
			entry.moc.toLowerCase().includes(lowerQuery)
		);
	}

	// Apply filters and search to ALL entries (not paginated)
	let filteredEntries = $derived.by(() => {
		let result = entries;

		// Apply search
		if (searchQuery.trim()) {
			result = result.filter((entry) => matchesSearch(entry, searchQuery));
		}

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

		// Filter by lines
		if (filtersStore.filters.lines.length > 0) {
			result = result.filter((entry) =>
				filtersStore.filters.lines.includes(entry.line)
			);
		}

		// Filter by responsibles
		if (filtersStore.filters.responsibles.length > 0) {
			result = result.filter((entry) =>
				filtersStore.filters.responsibles.includes(entry.responsible)
			);
		}

		// Filter by deadline range
		if (filtersStore.filters.deadlineRange.from) {
			const fromDate = new Date(filtersStore.filters.deadlineRange.from);
			result = result.filter((entry) => new Date(entry.deadline) >= fromDate);
		}
		if (filtersStore.filters.deadlineRange.to) {
			const toDate = new Date(filtersStore.filters.deadlineRange.to);
			toDate.setHours(23, 59, 59, 999);
			result = result.filter((entry) => new Date(entry.deadline) <= toDate);
		}

		// Filter by created date range
		if (filtersStore.filters.createdRange.from) {
			const fromDate = new Date(filtersStore.filters.createdRange.from);
			result = result.filter((entry) => new Date(entry.createdAt) >= fromDate);
		}
		if (filtersStore.filters.createdRange.to) {
			const toDate = new Date(filtersStore.filters.createdRange.to);
			toDate.setHours(23, 59, 59, 999);
			result = result.filter((entry) => new Date(entry.createdAt) <= toDate);
		}

		// Filter by updated date range
		if (filtersStore.filters.updatedRange.from) {
			const fromDate = new Date(filtersStore.filters.updatedRange.from);
			result = result.filter((entry) => new Date(entry.updatedAt) >= fromDate);
		}
		if (filtersStore.filters.updatedRange.to) {
			const toDate = new Date(filtersStore.filters.updatedRange.to);
			toDate.setHours(23, 59, 59, 999);
			result = result.filter((entry) => new Date(entry.updatedAt) <= toDate);
		}

		// Apply sorting
		if (sortColumn && sortDirection) {
			result = [...result].sort((a, b) => {
				const aVal = a[sortColumn!];
				const bVal = b[sortColumn!];

				if (aVal == null && bVal == null) return 0;
				if (aVal == null) return sortDirection === "asc" ? 1 : -1;
				if (bVal == null) return sortDirection === "asc" ? -1 : 1;

				let comparison = 0;
				if (typeof aVal === "number" && typeof bVal === "number") {
					comparison = aVal - bVal;
				} else if (sortColumn === "deadline" || sortColumn === "createdAt" || sortColumn === "updatedAt" || sortColumn === "implementationDate") {
					// Empty/invalid date strings produce NaN; treat them like nulls
					const aTime = new Date(aVal as string).getTime();
					const bTime = new Date(bVal as string).getTime();
					if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
					if (Number.isNaN(aTime)) return sortDirection === "asc" ? 1 : -1;
					if (Number.isNaN(bTime)) return sortDirection === "asc" ? -1 : 1;
					comparison = aTime - bTime;
				} else if (sortColumn === "id") {
					comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
				} else {
					comparison = String(aVal).localeCompare(String(bVal));
				}

				return sortDirection === "asc" ? comparison : -comparison;
			});
		}

		return result;
	});

	// Paginated entries - only for display
	let paginatedEntries = $derived.by(() => {
		const start = (currentPage - 1) * pageSize;
		const end = start + pageSize;
		return filteredEntries.slice(start, end);
	});

	// Reset to page 1 when filters or search changes
	$effect(() => {
		// Track these dependencies
		filtersStore.filters;
		searchQuery;
		// Reset page
		currentPage = 1;
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

	function handleExport() {
		// Export all filtered entries, not just current page
		exportToExcel(filteredEntries, columnsStore.columns);
	}

	function clearAllFilters() {
		filtersStore.clearAll();
		searchQuery = "";
	}

	let hasActiveFiltersOrSearch = $derived(filtersStore.hasActiveFilters || searchQuery.trim() !== "");

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
	<!-- Header -->
	{#if title || hasActiveFiltersOrSearch}
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-text text-2xl">
				{title}
				{#if hasActiveFiltersOrSearch}
					<span class="text-sm font-normal text-text-muted {title ? 'ml-2' : ''}">
						({filteredEntries.length} of {entries.length})
					</span>
				{/if}
			</h2>
		</div>
	{/if}

	<!-- Toolbar -->
	<div class="flex items-center gap-2 mb-4 flex-wrap">
		<SearchInput
			value={searchQuery}
			onchange={(value) => (searchQuery = value)}
			placeholder={m.table_search()}
		/>

		<div class="w-px h-6 bg-border-muted"></div>

		<RiskLevelFilter />
		<StatusFilter />
		<LineFilter options={uniqueLines} />
		<ResponsibleFilter options={uniqueResponsibles} />
		<DateRangeFilter label={m.filters_deadline()} type="deadline" />
		<DateRangeFilter label={m.filters_created()} type="created" />
		<DateRangeFilter label={m.filters_updated()} type="updated" />

		{#if hasActiveFiltersOrSearch}
			<button
				onclick={clearAllFilters}
				class="inline-flex items-center justify-center gap-1 h-8 px-3 text-sm text-danger hover:text-danger/80 transition-colors"
			>
				<X class="w-4 h-4" />
				{m.table_clearAll()}
			</button>
		{/if}

		<div class="w-px h-6 bg-border-muted"></div>

		<ColumnSelector />

		<button
			onclick={handleExport}
			class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-8 px-3 border-2 border-border bg-transparent hover:bg-bg-light hover:border-highlight transition-all text-text"
		>
			<Download class="w-4 h-4" />
			{m.table_export()}
		</button>
	</div>

	<!-- Table -->
	<div class="bg-bg-light border-2 border-border-muted">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					{#each columnsStore.visibleColumns as column (column.key)}
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
				{#each paginatedEntries as entry, index (entry.id)}
					<Table.Row
						class="cursor-pointer hover:bg-primary/5 transition-colors {index % 2 === 0 ? 'bg-bg-light' : 'bg-bg'}"
						onclick={() => entryEditStore.open(entry)}
					>
						{#each columnsStore.visibleColumns as column (column.key)}
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
				{#if paginatedEntries.length === 0}
					<Table.Row>
						<Table.Cell colspan={columnsStore.visibleColumns.length}>
							<div class="text-center py-8 text-text-muted">
								{#if hasActiveFiltersOrSearch}
									{m.table_noResultsFiltered()}
								{:else}
									{m.table_noResults()}
								{/if}
							</div>
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Pagination -->
	<div class="mt-4">
		<Pagination
			{currentPage}
			totalItems={filteredEntries.length}
			{pageSize}
			onPageChange={(page) => (currentPage = page)}
			onPageSizeChange={(size) => (pageSize = size)}
		/>
	</div>
</div>
