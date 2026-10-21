<script lang="ts">
	import { cn } from "$lib/utils";
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	interface Props {
		class?: string;
		sideOffset?: number;
		children?: Snippet;
	}

	let {
		class: className,
		sideOffset = 4,
		children,
		...restProps
	}: Props = $props();
</script>

<DropdownMenuPrimitive.Content
	{sideOffset}
	class={cn(
		"z-50 min-w-[8rem] overflow-hidden rounded-md border-2 border-border bg-bg-light p-1 text-text shadow-md",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</DropdownMenuPrimitive.Content>
