<script lang="ts">
	import { cn } from "$lib/utils";
	import { Dialog as SheetPrimitive } from "bits-ui";
	import { tv, type VariantProps } from "tailwind-variants";
	import SheetOverlay from "./sheet-overlay.svelte";
	import X from "lucide-svelte/icons/x";
	import type { Snippet } from "svelte";

	const sheetVariants = tv({
		base: "fixed z-50 gap-4 bg-bg-light border-l-2 border-border p-6 shadow-lg transition-transform duration-300 ease-in-out",
		variants: {
			side: {
				top: "inset-x-0 top-0 border-b",
				bottom: "inset-x-0 bottom-0 border-t",
				left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
				right: "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm",
			},
		},
		defaultVariants: {
			side: "right",
		},
	});

	type Side = VariantProps<typeof sheetVariants>["side"];

	interface Props {
		class?: string;
		side?: Side;
		children?: Snippet;
	}

	let {
		class: className,
		side = "right",
		children,
		...restProps
	}: Props = $props();
</script>

<SheetOverlay />
<SheetPrimitive.Content
	class={cn(sheetVariants({ side }), className)}
	{...restProps}
>
	{@render children?.()}
	<SheetPrimitive.Close
		class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-text"
	>
		<X class="h-4 w-4" />
		<span class="sr-only">Close</span>
	</SheetPrimitive.Close>
</SheetPrimitive.Content>
