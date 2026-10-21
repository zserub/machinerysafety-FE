<script lang="ts">
	import { cn } from "$lib/utils";
	import { Separator as SeparatorPrimitive } from "bits-ui";

	interface Props {
		class?: string;
		orientation?: "horizontal" | "vertical";
		decorative?: boolean;
	}

	let {
		class: className,
		orientation = "horizontal",
		decorative = true,
		...restProps
	}: Props = $props();
</script>

<SeparatorPrimitive.Root
	{decorative}
	{orientation}
	class={cn(
		"shrink-0 bg-border-muted",
		orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
		className
	)}
	{...restProps}
/>
