<script lang="ts">
	import { onMount } from "svelte";
	import * as m from "$lib/paraglide/messages";
	import { ExternalLink, BarChart3 } from "lucide-svelte";
	import MetabaseEmbed from "$lib/components/MetabaseEmbed.svelte";
	import { metabaseStore } from "$lib/stores/metabase.svelte";
	import { themeStore } from "$lib/stores/theme.svelte";

	onMount(() => metabaseStore.load());

	// Append Metabase theme parameter based on app theme
	let themedEmbedUrl = $derived(
		metabaseStore.embedUrl
			? `${metabaseStore.embedUrl}#theme=${themeStore.value === "dark" ? "night" : ""}`
			: ""
	);
</script>

<div class="p-8 space-y-6">
	{#if metabaseStore.fullUrl}
		<div class="flex justify-end">
			<a
				href={metabaseStore.fullUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-bg-light transition-colors"
			>
				{m.stats_openMetabase()}
				<ExternalLink class="h-4 w-4" />
			</a>
		</div>
	{/if}

	<div class="space-y-4">
		{#if metabaseStore.isConfigured}
			<MetabaseEmbed
				src={themedEmbedUrl}
				title={m.stats_title()}
				height="700px"
			/>
		{:else}
			<div class="rounded-lg border border-border bg-bg p-12 text-center">
				<BarChart3 class="h-16 w-16 mx-auto text-text-muted mb-4" />
				<h2 class="text-text text-lg font-medium mb-2">{m.stats_notConfigured()}</h2>
				<p class="text-text-muted max-w-md mx-auto">
					{m.stats_notConfiguredDesc()}
				</p>
			</div>
		{/if}
	</div>
</div>
