<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	interface Props extends HTMLAttributes<HTMLTableRowElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<tr
	class={cn(
		"border-b border-border-muted transition-colors hover:bg-highlight data-[state=selected]:bg-bg-light",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</tr>
