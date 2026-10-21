<script lang="ts">
	import { permissionsStore } from "$lib/stores/permissions.svelte";
	import type { Snippet } from "svelte";

	interface Props {
		permission: string | string[];
		mode?: "any" | "all";
		children: Snippet;
		fallback?: Snippet;
	}

	let { permission, mode = "any", children, fallback }: Props = $props();

	let hasPermission = $derived.by(() => {
		const perms = Array.isArray(permission) ? permission : [permission];
		return mode === "all" ? permissionsStore.hasAll(perms) : permissionsStore.hasAny(perms);
	});
</script>

{#if hasPermission}
	{@render children()}
{:else if fallback}
	{@render fallback()}
{/if}
