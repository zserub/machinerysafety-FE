<script lang="ts">
	import { cn } from "$lib/utils";
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import Check from "lucide-svelte/icons/check";
	import type { Snippet } from "svelte";

	interface Props {
		class?: string;
		checked?: boolean;
		onCheckedChange?: (checked: boolean) => void;
		children?: Snippet;
	}

	let {
		class: className,
		checked = $bindable(false),
		onCheckedChange,
		children,
		...restProps
	}: Props = $props();
</script>

<DropdownMenuPrimitive.CheckboxItem
	bind:checked
	{onCheckedChange}
	class={cn(
		"relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-bg focus:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
		className
	)}
	{...restProps}
>
	<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
		{#if checked}
			<Check class="h-4 w-4" />
		{/if}
	</span>
	{@render children?.()}
</DropdownMenuPrimitive.CheckboxItem>
