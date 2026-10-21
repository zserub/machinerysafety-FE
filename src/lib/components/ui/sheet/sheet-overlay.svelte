<script lang="ts">
	import { cn } from "$lib/utils";
	import { Dialog as SheetPrimitive } from "bits-ui";

	interface Props {
		class?: string;
	}

	let { class: className, ...restProps }: Props = $props();
</script>

<SheetPrimitive.Overlay
	class={cn(
		"fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
		className
	)}
	{...restProps}
/>
