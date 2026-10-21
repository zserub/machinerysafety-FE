<script lang="ts">
	import Search from "lucide-svelte/icons/search";
	import X from "lucide-svelte/icons/x";

	interface Props {
		value: string;
		onchange: (value: string) => void;
		placeholder?: string;
	}

	let { value, onchange, placeholder = "Search entries..." }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onchange(target.value);
	}

	function clear() {
		onchange("");
	}
</script>

<div class="relative">
	<Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
	<input
		type="text"
		{value}
		oninput={handleInput}
		{placeholder}
		class="h-8 w-64 pl-8 pr-8 text-sm bg-bg-light border-2 border-border rounded-md text-text placeholder:text-text-muted focus:outline-none focus:border-highlight transition-colors"
	/>
	{#if value}
		<button
			onclick={clear}
			class="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
		>
			<X class="w-4 h-4" />
		</button>
	{/if}
</div>
