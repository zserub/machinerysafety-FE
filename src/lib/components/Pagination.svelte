<script lang="ts">
	import * as m from "$lib/paraglide/messages";
	import ChevronLeft from "lucide-svelte/icons/chevron-left";
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import ChevronsLeft from "lucide-svelte/icons/chevrons-left";
	import ChevronsRight from "lucide-svelte/icons/chevrons-right";
	import ChevronDown from "lucide-svelte/icons/chevron-down";

	interface Props {
		currentPage: number;
		totalItems: number;
		pageSize: number;
		onPageChange: (page: number) => void;
		onPageSizeChange: (size: number) => void;
	}

	let { currentPage, totalItems, pageSize, onPageChange, onPageSizeChange }: Props = $props();

	let pageSizeDropdownOpen = $state(false);

	const pageSizeOptions = [25, 50, 100, 250, 500];

	let totalPages = $derived(Math.ceil(totalItems / pageSize));
	let startItem = $derived((currentPage - 1) * pageSize + 1);
	let endItem = $derived(Math.min(currentPage * pageSize, totalItems));

	let canGoPrevious = $derived(currentPage > 1);
	let canGoNext = $derived(currentPage < totalPages);

	function goToFirst() {
		if (canGoPrevious) onPageChange(1);
	}

	function goToPrevious() {
		if (canGoPrevious) onPageChange(currentPage - 1);
	}

	function goToNext() {
		if (canGoNext) onPageChange(currentPage + 1);
	}

	function goToLast() {
		if (canGoNext) onPageChange(totalPages);
	}

	function handlePageSizeChange(size: number) {
		onPageSizeChange(size);
		pageSizeDropdownOpen = false;
		// Reset to first page when changing page size
		onPageChange(1);
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest(".page-size-selector")) {
			pageSizeDropdownOpen = false;
		}
	}
</script>

<svelte:document onclick={handleClickOutside} />

<div class="flex items-center justify-between">
	<!-- Page size selector -->
	<div class="flex items-center gap-2">
		<span class="text-sm text-text-muted">{m.pagination_rowsPerPage()}</span>
		<div class="page-size-selector relative">
			<button
				onclick={() => (pageSizeDropdownOpen = !pageSizeDropdownOpen)}
				class="inline-flex items-center justify-center gap-1 h-8 px-3 text-sm border-2 border-border rounded-md hover:bg-bg-light hover:border-highlight transition-all text-text"
			>
				{pageSize}
				<ChevronDown class="w-4 h-4" />
			</button>

			{#if pageSizeDropdownOpen}
				<div
					class="absolute bottom-full left-0 mb-1 w-24 bg-bg-light border-2 border-border rounded-md shadow-md z-50 py-1"
				>
					{#each pageSizeOptions as option}
						<button
							onclick={() => handlePageSizeChange(option)}
							class="w-full px-3 py-1.5 text-sm text-left hover:bg-bg transition-colors {option ===
							pageSize
								? 'text-primary'
								: 'text-text'}"
						>
							{option}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Info and navigation -->
	<div class="flex items-center gap-4">
		<span class="text-sm text-text-muted">
			{#if totalItems > 0}
				{startItem}-{endItem} {m.pagination_of()} {totalItems}
			{:else}
				{m.table_noResults()}
			{/if}
		</span>

		<div class="flex items-center gap-1">
			<button
				onclick={goToFirst}
				disabled={!canGoPrevious}
				class="inline-flex items-center justify-center w-8 h-8 rounded-md border-2 border-border hover:bg-bg-light hover:border-highlight transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-border"
				title={m.pagination_first()}
			>
				<ChevronsLeft class="w-4 h-4" />
			</button>
			<button
				onclick={goToPrevious}
				disabled={!canGoPrevious}
				class="inline-flex items-center justify-center w-8 h-8 rounded-md border-2 border-border hover:bg-bg-light hover:border-highlight transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-border"
				title={m.pagination_previous()}
			>
				<ChevronLeft class="w-4 h-4" />
			</button>

			<span class="px-2 text-sm text-text">
				{m.pagination_page()} {currentPage} {m.pagination_of()} {totalPages || 1}
			</span>

			<button
				onclick={goToNext}
				disabled={!canGoNext}
				class="inline-flex items-center justify-center w-8 h-8 rounded-md border-2 border-border hover:bg-bg-light hover:border-highlight transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-border"
				title={m.pagination_next()}
			>
				<ChevronRight class="w-4 h-4" />
			</button>
			<button
				onclick={goToLast}
				disabled={!canGoNext}
				class="inline-flex items-center justify-center w-8 h-8 rounded-md border-2 border-border hover:bg-bg-light hover:border-highlight transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-border"
				title={m.pagination_last()}
			>
				<ChevronsRight class="w-4 h-4" />
			</button>
		</div>
	</div>
</div>
