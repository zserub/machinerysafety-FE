<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import * as m from "$lib/paraglide/messages";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import { metadataStore } from "$lib/stores/metadata.svelte";
	import { riskCreateStore, type LinkedRiskSummary, type RiskType } from "$lib/stores/riskCreate.svelte";
	import { entriesApi } from "$lib/api/entries";
	import { uiLogger } from "$lib/utils/logger";
	import Search from "lucide-svelte/icons/search";
	import Link from "lucide-svelte/icons/link";
	import Loader2 from "lucide-svelte/icons/loader-2";

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		targetRiskType: RiskType;
		onSelect: (risk: LinkedRiskSummary) => void;
	}

	let { open, onOpenChange, targetRiskType, onSelect }: Props = $props();

	let searchQuery = $state("");
	let isLoading = $state(false);
	let results = $state<LinkedRiskSummary[]>([]);
	let hasSearched = $state(false);

	// The opposite type we're searching for
	let searchingForType = $derived((targetRiskType === 1 ? 2 : 1) as RiskType);
	let typeLabel = $derived(
		searchingForType === 1 ? m.linkedRisk_shortTerm() : m.linkedRisk_longTerm()
	);

	async function handleSearch() {
		if (!searchQuery.trim()) return;

		isLoading = true;
		hasSearched = true;

		try {
			// Search for risks of the opposite type
			const response = await entriesApi.getAll({
				search: searchQuery,
			});

			// Filter to only show opposite type risks
			// In a real implementation, the API would support riskType filtering
			results = response.entries
				.filter((entry) => {
					// Assuming entries have a riskType field or we determine it somehow
					// For now, show all results - backend should filter by type
					return true;
				})
				.map((entry) => ({
					id: entry.id,
					machine: entry.machine,
					line: entry.line,
					descriptionOfDanger: entry.descriptionOfDanger,
					riskType: searchingForType,
				}));
		} catch (error) {
			uiLogger.error("Search failed:", error);
			results = [];
		} finally {
			isLoading = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			handleSearch();
		}
	}

	function handleSelect(risk: LinkedRiskSummary) {
		onSelect(risk);
		onOpenChange(false);
		// Reset state
		searchQuery = "";
		results = [];
		hasSearched = false;
	}

	function handleClose() {
		onOpenChange(false);
		searchQuery = "";
		results = [];
		hasSearched = false;
	}

	type BadgeVariant = "destructive" | "warning" | "info" | "success" | "default" | "secondary" | "outline";
</script>

<Dialog.Root {open} onOpenChange={handleClose}>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{m.linkedRisk_modalTitle()}</Dialog.Title>
			<Dialog.Description>
				{m.linkedRisk_modalDescription({ type: typeLabel })}
			</Dialog.Description>
		</Dialog.Header>

		<div class="p-6 space-y-4">
			<!-- Search input -->
			<div class="flex gap-2">
				<div class="relative flex-1">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
					<input
						type="text"
						bind:value={searchQuery}
						onkeydown={handleKeydown}
						placeholder={m.linkedRisk_searchPlaceholder()}
						class="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
				<Button onclick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
					{#if isLoading}
						<Loader2 class="h-4 w-4 animate-spin" />
					{:else}
						<Search class="h-4 w-4" />
					{/if}
				</Button>
			</div>

			<!-- Results -->
			<div class="min-h-[300px] max-h-[400px] overflow-y-auto">
				{#if isLoading}
					<div class="flex items-center justify-center h-[300px]">
						<Loader2 class="h-8 w-8 animate-spin text-text-muted" />
					</div>
				{:else if results.length > 0}
					<div class="space-y-2">
						{#each results as risk (risk.id)}
							<button
								type="button"
								onclick={() => handleSelect(risk)}
								class="w-full p-4 text-left bg-bg hover:bg-bg-dark border border-border rounded-lg transition-colors group"
							>
								<div class="flex items-start justify-between gap-4">
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2 mb-1">
											<span class="text-sm font-mono text-text-muted">#{risk.id}</span>
											<Badge variant="secondary" class="text-xs">
												{risk.riskType === 1 ? m.riskType_shortTerm() : m.riskType_longTerm()}
											</Badge>
										</div>
										<p class="text-text font-medium truncate">{risk.machine}</p>
										<p class="text-sm text-text-muted line-clamp-2">{risk.descriptionOfDanger}</p>
										<p class="text-xs text-text-muted mt-1">{risk.line}</p>
									</div>
									<div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
										<Link class="h-5 w-5 text-primary" />
									</div>
								</div>
							</button>
						{/each}
					</div>
				{:else if hasSearched}
					<div class="flex flex-col items-center justify-center h-[300px] text-text-muted">
						<Search class="h-12 w-12 mb-2 opacity-50" />
						<p>{m.linkedRisk_noResults()}</p>
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center h-[300px] text-text-muted">
						<Link class="h-12 w-12 mb-2 opacity-50" />
						<p class="text-center">
							{m.linkedRisk_searchPlaceholder()}
						</p>
					</div>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={handleClose}>
				{m.modal_cancel()}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
