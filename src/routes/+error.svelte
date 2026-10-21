<script lang="ts">
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button";
	import * as m from "$lib/paraglide/messages";
	import AlertTriangle from "lucide-svelte/icons/alert-triangle";
	import RefreshCw from "lucide-svelte/icons/refresh-cw";
	import Home from "lucide-svelte/icons/home";

	function handleRetry() {
		window.location.reload();
	}

	function handleGoHome() {
		goto("/");
	}
</script>

<div class="min-h-screen bg-bg-dark flex items-center justify-center p-8">
	<div class="text-center max-w-md">
		<div class="flex justify-center mb-6">
			<div class="p-4 bg-danger/10 rounded-full">
				<AlertTriangle class="w-12 h-12 text-danger" />
			</div>
		</div>

		<h1 class="text-3xl font-bold text-text mb-2">{m.error_title()}</h1>

		{#if $page.status}
			<p class="text-5xl font-bold text-text-muted mb-4">{$page.status}</p>
		{/if}

		<p class="text-text-muted mb-8">
			{$page.error?.message || m.error_message()}
		</p>

		<div class="flex gap-4 justify-center">
			<Button variant="outline" onclick={handleRetry}>
				<RefreshCw class="w-4 h-4 mr-2" />
				{m.error_tryAgain()}
			</Button>
			<Button onclick={handleGoHome}>
				<Home class="w-4 h-4 mr-2" />
				{m.error_goHome()}
			</Button>
		</div>
	</div>
</div>
