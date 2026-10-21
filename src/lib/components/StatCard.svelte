<script lang="ts">
	import type { ComponentType, SvelteComponent } from "svelte";

	interface Props {
		icon: ComponentType<SvelteComponent<{ class?: string }>>;
		label: string;
		value: number;
		color: "danger" | "warning" | "success" | "info" | "primary";
	}

	let { icon: Icon, label, value, color }: Props = $props();

	const colorClasses = {
		danger: "text-danger",
		warning: "text-warning",
		success: "text-success",
		info: "text-info",
		primary: "text-primary",
	};
</script>

<div class="flex-1 bg-bg-light border-2 border-border-muted p-6">
	<div class="flex items-center gap-4">
		<Icon class="w-12 h-12 {colorClasses[color]}" />
		<div>
			<div class="text-4xl font-bold {colorClasses[color]}">{value}</div>
			<div class="text-text-muted text-lg mt-1">{label}</div>
		</div>
	</div>
</div>
