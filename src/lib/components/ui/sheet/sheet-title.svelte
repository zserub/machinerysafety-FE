<script lang="ts">
	import { cn } from "$lib/utils";
	import { Dialog as SheetPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<SheetPrimitive.Title
	class={cn("text-lg font-semibold text-text", className)}
	{...restProps}
>
	{@render children?.()}
</SheetPrimitive.Title>
