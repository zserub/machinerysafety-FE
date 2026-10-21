<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import { themeStore } from "$lib/stores/theme.svelte";
	import { languageStore, languages } from "$lib/stores/language.svelte";
	import { userStore } from "$lib/stores/user.svelte";
	import { versionStore } from "$lib/stores/version.svelte";
	import * as m from "$lib/paraglide/messages";
	import User from "lucide-svelte/icons/user";
	import Sun from "lucide-svelte/icons/sun";
	import Moon from "lucide-svelte/icons/moon";
	import Languages from "lucide-svelte/icons/languages";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import X from "lucide-svelte/icons/x";

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}

	let { open = $bindable(), onOpenChange }: Props = $props();
	let langDropdownOpen = $state(false);

	$effect(() => {
		if (open) {
			versionStore.fetchBackendVersion();
		}
	});

	function close() {
		onOpenChange(false);
	}

	function selectLanguage(code: typeof languages[number]["code"]) {
		languageStore.value = code;
		langDropdownOpen = false;
	}
</script>

{#if open}
	<!-- Overlay -->
	<div
		class="fixed inset-0 z-40 bg-black/50 transition-opacity"
		onclick={close}
		role="button"
		tabindex="-1"
		onkeydown={(e) => e.key === "Escape" && close()}
	></div>

	<!-- Sidebar Panel -->
	<div
		class="fixed right-0 top-0 h-full w-[360px] bg-bg-light border-l-2 border-border z-50 p-6 shadow-lg flex flex-col"
	>
		<button
			onclick={close}
			class="absolute right-4 top-4 rounded-sm border-2 border-transparent hover:border-highlight p-1 text-text transition-all"
		>
			<X class="h-5 w-5" />
		</button>

		<div class="flex flex-col gap-6 pt-8 flex-1">
			<!-- Username Button -->
			<Button variant="outline" class="w-full px-6 py-6 text-xl justify-center gap-2">
				<User class="w-5 h-5" />
				{userStore.displayName}
			</Button>

			<Separator />

			<!-- Theme Toggle -->
			<Button
				variant="outline"
				class="w-full px-6 py-4 justify-start gap-3"
				onclick={() => themeStore.toggle()}
			>
				{#if themeStore.value === "dark"}
					<Moon class="w-5 h-5 text-primary" />
					<span class="flex-1 text-left">{m.sidebar_darkTheme()}</span>
				{:else}
					<Sun class="w-5 h-5 text-primary" />
					<span class="flex-1 text-left">{m.sidebar_lightTheme()}</span>
				{/if}
			</Button>

			<!-- Language Selection -->
			<div class="relative">
				<button
					onclick={() => (langDropdownOpen = !langDropdownOpen)}
					class="w-full flex items-center gap-2 px-6 py-4 border-2 border-border bg-transparent hover:bg-bg-light hover:border-highlight transition-all text-text rounded-md"
				>
					<Languages class="w-5 h-5" />
					<span class="flex-1 text-left">{m.sidebar_language()}: {languageStore.getName()}</span>
					<ChevronDown class="w-5 h-5" />
				</button>
				{#if langDropdownOpen}
					<div
						class="absolute top-full left-0 mt-1 w-full bg-bg-light border-2 border-border rounded-md shadow-md z-50 py-1"
					>
						{#each languages as lang}
							<button
								onclick={() => selectLanguage(lang.code)}
								class="w-full px-4 py-2 text-left transition-colors {languageStore.value ===
								lang.code
									? 'text-primary'
									: 'text-text-muted hover:bg-bg hover:text-primary'}"
							>
								{lang.getName()}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Version Info -->
		<div class="text-xs text-text-muted space-y-1">
			<div>{m.version_frontend()}: {versionStore.frontend}</div>
			<div>{m.version_backend()}: {versionStore.backend}</div>
		</div>
	</div>
{/if}
