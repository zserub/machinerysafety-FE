<script lang="ts">
	import { cn } from "$lib/utils";
	import { Checkbox as CheckboxPrimitive } from "bits-ui";
	import Check from "lucide-svelte/icons/check";

	interface Props {
		checked?: boolean;
		disabled?: boolean;
		class?: string;
		onCheckedChange?: (checked: boolean) => void;
	}

	let {
		checked = $bindable(false),
		disabled = false,
		class: className,
		onCheckedChange,
	}: Props = $props();
</script>

<CheckboxPrimitive.Root
	bind:checked
	{disabled}
	{onCheckedChange}
	class={cn(
		"peer h-4 w-4 shrink-0 rounded-sm border border-border shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-bg-dark data-[state=checked]:border-primary",
		className
	)}
>
	{#snippet children({ checked })}
		<div class="flex items-center justify-center text-current">
			{#if checked}
				<Check class="h-3.5 w-3.5" />
			{/if}
		</div>
	{/snippet}
</CheckboxPrimitive.Root>
