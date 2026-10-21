<script lang="ts">
	import { cn } from "$lib/utils";
	import { Dialog as DialogPrimitive } from "bits-ui";

	interface Props {
		class?: string;
	}

	let { class: className, ...restProps }: Props = $props();
</script>

<DialogPrimitive.Overlay
	class={cn(
		"fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
		className
	)}
	{...restProps}
/>
