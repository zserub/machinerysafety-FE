<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { userStore } from "$lib/stores/user.svelte";
	import { permissionsStore } from "$lib/stores/permissions.svelte";
	import { goto } from "$app/navigation";
	import * as m from "$lib/paraglide/messages";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import LogOut from "lucide-svelte/icons/log-out";
	import Settings from "lucide-svelte/icons/settings";
	import LayoutDashboard from "lucide-svelte/icons/layout-dashboard";
	import Table from "lucide-svelte/icons/table";
	import BarChart3 from "lucide-svelte/icons/bar-chart-3";
	import PlusCircle from "lucide-svelte/icons/plus-circle";
	import Users from "lucide-svelte/icons/users";
	interface Props {
		currentPage: string;
		onPageChange: (page: string) => void;
		onSidebarToggle: () => void;
	}

	let { currentPage, onPageChange, onSidebarToggle }: Props = $props();

	let dropdownOpen = $state(false);

	const allPages = [
		{ id: "Dashboard", getLabel: () => m.nav_dashboard(), href: "/", icon: LayoutDashboard, permission: "dashboard:view" },
		{ id: "View all risks", getLabel: () => m.nav_viewAllRisks(), href: "/table", icon: Table, permission: "entries:view" },
		{ id: "Statistics", getLabel: () => m.nav_statistics(), href: "/stats", icon: BarChart3, permission: "statistics:view" },
		{ id: "New Risk", getLabel: () => m.nav_newRisk(), href: "/add_risk", icon: PlusCircle, permission: "entries:create" },
		{ id: "SuperVisor", getLabel: () => m.nav_supervisor(), href: "/supviso", icon: Users, permission: "supervisor_dashboard:view" },
	];

	// Filter pages based on user permissions
	let pages = $derived(allPages.filter((page) => permissionsStore.has(page.permission)));

	function getPageLabel(pageId: string): string {
		const page = pages.find((p) => p.id === pageId);
		return page?.getLabel() ?? pageId;
	}

	function getPageIcon(pageId: string) {
		const page = pages.find((p) => p.id === pageId);
		return page?.icon ?? null;
	}

	async function handleLogout() {
		await userStore.logout();
		await goto("/login");
	}

	function selectPage(pageId: string) {
		dropdownOpen = false;
		onPageChange(pageId);
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest(".page-dropdown")) {
			dropdownOpen = false;
		}
	}
</script>

<svelte:document onclick={handleClickOutside} />

<header class="flex items-center justify-between px-6 py-4 border-b-2 border-border bg-bg-dark">
	<div class="flex items-center gap-4">
		<div class="page-dropdown relative">
			<button
				onclick={() => (dropdownOpen = !dropdownOpen)}
				class="flex items-center gap-3 px-6 py-4 border-2 border-border bg-transparent hover:bg-bg-light hover:border-highlight transition-all text-2xl font-extrabold text-text rounded-md"
			>
				{#if getPageIcon(currentPage)}
					<svelte:component this={getPageIcon(currentPage)} class="w-7 h-7" />
				{/if}
				{m.appName()} - {getPageLabel(currentPage)}
				<ChevronDown class="w-5 h-5 text-text-muted" />
			</button>
			{#if dropdownOpen}
				<div
					class="absolute top-full left-0 mt-1 w-64 bg-bg-light border-2 border-border rounded-md shadow-md z-50 py-1"
				>
					{#each pages as page}
						<button
							onclick={() => selectPage(page.id)}
							class="w-full px-4 py-2 text-left text-text-muted hover:bg-bg hover:text-primary transition-colors flex items-center gap-3"
						>
							<svelte:component this={page.icon} class="w-5 h-5" />
							{page.getLabel()}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="flex items-center gap-6">
		<span class="text-primary text-xl">{userStore.displayName}</span>

		<Button variant="outline" onclick={handleLogout} class="flex items-center gap-2">
			<LogOut class="w-5 h-5" />
			{m.auth_logout()}
		</Button>

		<Button
			variant="outline"
			size="icon"
			onclick={onSidebarToggle}
			class="rounded-full p-3 w-12 h-12"
		>
			<Settings class="w-6 h-6" />
		</Button>
	</div>
</header>
