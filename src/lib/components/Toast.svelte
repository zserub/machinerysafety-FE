<script lang="ts">
	import { toastStore, type ToastType } from "$lib/stores/toast.svelte";
	import X from "lucide-svelte/icons/x";
	import Check from "lucide-svelte/icons/check";
	import AlertCircle from "lucide-svelte/icons/alert-circle";
	import Info from "lucide-svelte/icons/info";
	import AlertTriangle from "lucide-svelte/icons/alert-triangle";

	const iconMap: Record<ToastType, typeof Check> = {
		success: Check,
		error: AlertCircle,
		info: Info,
		warning: AlertTriangle,
	};

	const styleMap: Record<ToastType, string> = {
		success: "bg-success/10 border-success text-success",
		error: "bg-danger/10 border-danger text-danger",
		info: "bg-info/10 border-info text-info",
		warning: "bg-warning/10 border-warning text-warning",
	};
</script>

{#if toastStore.toasts.length > 0}
	<div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
		{#each toastStore.toasts as toast (toast.id)}
			<div
				class="flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-[400px] animate-slide-in-right {styleMap[
					toast.type
				]}"
			>
				<svelte:component this={iconMap[toast.type]} class="h-5 w-5 flex-shrink-0" />
				<span class="flex-1 text-sm font-medium text-text">{toast.message}</span>
				<button
					onclick={() => toastStore.remove(toast.id)}
					class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
				>
					<X class="h-4 w-4" />
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	@keyframes slide-in-right {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.animate-slide-in-right {
		animation: slide-in-right 0.3s ease-out;
	}
</style>
