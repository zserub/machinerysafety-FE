<script lang="ts">
	import { cn } from "$lib/utils";
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	interface Props {
		class?: string;
		inset?: boolean;
		children?: Snippet;
		onSelect?: () => void;
		onclick?: () => void;
	}

	let {
		class: className,
		inset = false,
		children,
		onSelect,
		onclick,
		...restProps
	}: Props = $props();

	// Support both onSelect (bits-ui) and onclick (convenience)
	function handleSelect() {
		onSelect?.();
		onclick?.();
	}
</script>

<DropdownMenuPrimitive.Item
	class={cn(
		"relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-bg focus:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
		inset && "pl-8",
		className
	)}
	onSelect={handleSelect}
	{...restProps}
>
	{@render children?.()}
</DropdownMenuPrimitive.Item>
