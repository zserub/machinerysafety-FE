<script lang="ts">
	import { onMount } from "svelte";
	import StatCard from "$lib/components/StatCard.svelte";
	import EntriesTable from "$lib/components/EntriesTable.svelte";
	import { entriesStore } from "$lib/stores/entries.svelte";
	import { toastStore } from "$lib/stores/toast.svelte";
	import * as m from "$lib/paraglide/messages";
	import AlertCircle from "lucide-svelte/icons/alert-circle";
	import Clock from "lucide-svelte/icons/clock";
	import CircleArrowUp from "lucide-svelte/icons/circle-arrow-up";
	import RefreshCw from "lucide-svelte/icons/refresh-cw";
	import { Button } from "$lib/components/ui/button";

	onMount(async () => {
		try {
			await entriesStore.fetchMyEntries();
		} catch {
			toastStore.error(m.entries_loadError());
		}
	});

	// Calculate statistics from store entries
	const urgentActions = $derived(entriesStore.entries.filter((e) => e.riskLevel === "urgent").length);
	const closeDeadlineActions = $derived(
		entriesStore.entries.filter((e) => {
			const deadline = new Date(e.deadline);
			const today = new Date();
			const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
			return diff <= 7 && diff >= 0;
		}).length
	);
	const totalActions = $derived(entriesStore.entries.length);

	async function handleRetry() {
		try {
			await entriesStore.fetchMyEntries();
		} catch {
			toastStore.error(m.entries_loadError());
		}
	}
</script>

<div class="p-8 space-y-8">
	<!-- Action Statistics -->
	<div>
		<h2 class="text-text text-2xl mb-4">{m.stats_actionStatistics()}</h2>
		{#if entriesStore.loading}
			<div class="flex gap-6">
				<div class="h-24 w-48 bg-bg-light rounded-lg animate-pulse"></div>
				<div class="h-24 w-48 bg-bg-light rounded-lg animate-pulse"></div>
				<div class="h-24 w-48 bg-bg-light rounded-lg animate-pulse"></div>
			</div>
		{:else}
			<div class="flex gap-6">
				<StatCard icon={AlertCircle} label={m.stats_urgentActions()} value={urgentActions} color="danger" />
				<StatCard
					icon={Clock}
					label={m.stats_closeDeadlineActions()}
					value={closeDeadlineActions}
					color="warning"
				/>
				<StatCard icon={CircleArrowUp} label={m.stats_totalActions()} value={totalActions} color="success" />
			</div>
		{/if}
	</div>

	<!-- My Entries Table -->
	{#if entriesStore.loading}
		<div class="space-y-4">
			<div class="h-8 w-32 bg-bg-light rounded animate-pulse"></div>
			<div class="space-y-2">
				{#each Array(5) as _}
					<div class="h-12 bg-bg-light rounded animate-pulse"></div>
				{/each}
			</div>
		</div>
	{:else if entriesStore.error}
		<div class="flex flex-col items-center justify-center py-12 space-y-4">
			<p class="text-text-muted">{m.entries_loadError()}</p>
			<Button variant="outline" onclick={handleRetry}>
				<RefreshCw class="w-4 h-4 mr-2" />
				{m.entries_retry()}
			</Button>
		</div>
	{:else if entriesStore.entries.length === 0}
		<div class="flex flex-col items-center justify-center py-12">
			<p class="text-text-muted">{m.entries_empty()}</p>
		</div>
	{:else}
		<EntriesTable entries={entriesStore.entries} />
	{/if}
</div>
