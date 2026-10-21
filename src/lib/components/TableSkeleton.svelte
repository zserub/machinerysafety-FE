<script lang="ts">
	import * as Table from "$lib/components/ui/table";

	interface Props {
		rows?: number;
		columns?: number;
	}

	let { rows = 10, columns = 8 }: Props = $props();
</script>

<Table.Body>
	{#each Array(rows) as _, rowIndex}
		<Table.Row class={rowIndex % 2 === 0 ? "bg-bg-light" : "bg-bg"}>
			{#each Array(columns) as _, colIndex}
				<Table.Cell>
					<div
						class="h-4 rounded bg-border-muted animate-pulse"
						style="width: {60 + ((colIndex * 17) % 40)}%"
					></div>
				</Table.Cell>
			{/each}
		</Table.Row>
	{/each}
</Table.Body>
