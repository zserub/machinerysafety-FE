<script lang="ts">
	import { cn } from "$lib/utils";
	import { Dialog as DialogPrimitive } from "bits-ui";
	import DialogOverlay from "./dialog-overlay.svelte";
	import X from "lucide-svelte/icons/x";
	import type { Snippet } from "svelte";

	interface Props {
		class?: string;
		children?: Snippet;
		showCloseButton?: boolean;
	}

	let {
		class: className,
		children,
		showCloseButton = true,
		...restProps
	}: Props = $props();
</script>

<DialogPrimitive.Portal>
	<DialogOverlay />
	<DialogPrimitive.Content
		class={cn(
			"fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
			"w-full max-w-[1100px] max-h-[90vh]",
			"bg-bg-light border border-border rounded-lg shadow-xl",
			"flex flex-col",
			"transition-all duration-300 ease-out",
			"data-[state=open]:animate-in data-[state=closed]:animate-out",
			"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
			"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
			"data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
			"data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		{#if showCloseButton}
			<DialogPrimitive.Close
				class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-text-muted hover:text-text"
			>
				<X class="h-5 w-5" />
				<span class="sr-only">Close</span>
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</DialogPrimitive.Portal>
