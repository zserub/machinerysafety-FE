<script lang="ts">
	import { onMount } from "svelte";
	import AllEntriesTable from "$lib/components/AllEntriesTable.svelte";
	import { entriesStore } from "$lib/stores/entries.svelte";
	import { toastStore } from "$lib/stores/toast.svelte";
	import { Button } from "$lib/components/ui/button";
	import * as m from "$lib/paraglide/messages";
	import RefreshCw from "lucide-svelte/icons/refresh-cw";

	onMount(async () => {
		try {
			await entriesStore.fetchAll();
		} catch {
			toastStore.error(m.entries_loadError());
		}
	});

	async function handleRetry() {
		try {
			await entriesStore.fetchAll();
		} catch {
			toastStore.error(m.entries_loadError());
		}
	}
</script>

<div class="p-8">
	{#if entriesStore.loading}
		<div class="space-y-4">
			<div class="flex items-center gap-2 mb-4">
				<div class="h-8 w-64 bg-bg-light rounded animate-pulse"></div>
				<div class="h-8 w-24 bg-bg-light rounded animate-pulse"></div>
				<div class="h-8 w-24 bg-bg-light rounded animate-pulse"></div>
			</div>
			<div class="bg-bg-light border-2 border-border-muted">
				<div class="space-y-1">
					{#each Array(10) as _}
						<div class="h-12 bg-bg rounded animate-pulse"></div>
					{/each}
				</div>
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
	{:else}
		<AllEntriesTable entries={entriesStore.entries} />
	{/if}
</div>
