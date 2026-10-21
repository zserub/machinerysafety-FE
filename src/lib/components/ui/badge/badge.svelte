<script lang="ts">
	import { cn } from "$lib/utils";
	import { badgeVariants, type Variant } from "./index";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: Variant;
		class?: string;
		children?: Snippet;
	}

	let {
		variant = "default",
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<div class={cn(badgeVariants({ variant }), className)} {...restProps}>
	{@render children?.()}
</div>
