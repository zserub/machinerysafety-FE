<script lang="ts">
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<div
	class={cn(
		"flex items-center justify-between p-6 border-t border-border bg-bg",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
