<script lang="ts">
	import * as m from "$lib/paraglide/messages";
	import { Loader2, AlertCircle, RefreshCw } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";

	interface Props {
		src: string;
		title?: string;
		height?: string;
	}

	let { src, title = "Dashboard", height = "600px" }: Props = $props();

	let loading = $state(true);
	let error = $state(false);

	function handleLoad() {
		loading = false;
		error = false;
	}

	function handleError() {
		loading = false;
		error = true;
	}

	function retry() {
		loading = true;
		error = false;
	}
</script>

<div class="relative w-full rounded-lg border border-border bg-bg overflow-hidden" style="min-height: {height}">
	{#if loading && !error}
		<div class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg">
			<Loader2 class="h-8 w-8 animate-spin text-primary" />
			<span class="text-text-muted text-sm">{m.stats_loading()}</span>
		</div>
	{/if}

	{#if error}
		<div class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg">
			<AlertCircle class="h-12 w-12 text-danger" />
			<span class="text-text-muted">{m.stats_loadError()}</span>
			<Button variant="outline" size="sm" onclick={retry}>
				<RefreshCw class="h-4 w-4 mr-2" />
				{m.stats_retry()}
			</Button>
		</div>
	{/if}

	{#if src}
		{#key loading}
			<iframe
				{title}
				src={loading ? src : src}
				class="w-full border-0"
				style="height: {height}; display: {error ? 'none' : 'block'};"
				onload={handleLoad}
				onerror={handleError}
				sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
				loading="lazy"
			></iframe>
		{/key}
	{:else}
		<div class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg">
			<AlertCircle class="h-12 w-12 text-warning" />
			<span class="text-text-muted">No dashboard URL configured</span>
		</div>
	{/if}
</div>
