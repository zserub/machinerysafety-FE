<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import Header from "$lib/components/Header.svelte";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import EntryEditModal from "$lib/components/EntryEditModal.svelte";
	import Toast from "$lib/components/Toast.svelte";
	import { Button } from "$lib/components/ui/button";
	import { userStore } from "$lib/stores/user.svelte";
	import { themeStore } from "$lib/stores/theme.svelte";
	import { languageStore } from "$lib/stores/language.svelte";
	import { columnsStore } from "$lib/stores/columns.svelte";
	import { permissionsStore } from "$lib/stores/permissions.svelte";
	import { fetchMetadata } from "$lib/api/metadata";
	import { getPreferences } from "$lib/api/preferences";
	import { fetchPermissions } from "$lib/api/permissions";
	import { getRoutePermission } from "$lib/config/routes";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import * as m from "$lib/paraglide/messages";

	let { children } = $props();
	let sidebarOpen = $state(false);
	let initialized = $state(false);
	let appInitialized = $state(false); // True only after full app initialization (API calls done)
	let sessionChecked = $state(false); // True after we've checked for existing session

	// Check if we're on the login page
	let isLoginPage = $derived($page.url.pathname === "/login");

	// Check if user has permission for current route
	let hasRoutePermission = $derived.by(() => {
		if (!permissionsStore.initialized) return true; // Still loading
		const requiredPermission = getRoutePermission($page.url.pathname);
		if (!requiredPermission) return true; // No permission required (login page)
		return permissionsStore.has(requiredPermission);
	});

	// Determine current page from URL
	let currentPage = $derived.by(() => {
		const path = $page.url.pathname;
		if (path === "/") return "Dashboard";
		if (path.startsWith("/table")) return "View all risks";
		if (path.startsWith("/stats")) return "Statistics";
		if (path.startsWith("/settings")) return "Settings";
		if (path.startsWith("/add_risk")) return "New Risk";
		if (path.startsWith("/supviso")) return "SuperVisor";
		return "Dashboard";
	});

	function handlePageChange(pageName: string) {
		const routes: Record<string, string> = {
			"Dashboard": "/",
			"View all risks": "/table",
			"Statistics": "/stats",
			"Settings": "/settings",
			"New Risk": "/add_risk",
			"SuperVisor": "/supviso",
		};
		goto(routes[pageName] || "/");
	}

	// Track if we've started initialization to prevent duplicate runs
	let initStarted = $state(false);

	// Restore session on initial page load
	$effect(() => {
		if (sessionChecked) return;

		// On login page, don't try to restore - just mark as checked
		if (isLoginPage) {
			sessionChecked = true;
			return;
		}

		// Try to restore session from backend cookie
		userStore.restoreSession().then(() => {
			sessionChecked = true;
		});
	});

	async function initializeApp() {
		if (initStarted || appInitialized) return;
		initStarted = true;

		try {
			// Initialize stores with user-scoped localStorage
			const userId = userStore.userId;
			themeStore.initForUser(userId);
			languageStore.initForUser(userId);
			columnsStore.initForUser(userId);

			// Fetch user preferences from backend and apply them
			const prefs = await getPreferences();
			themeStore.setFromBackend(prefs.theme);
			languageStore.setFromBackend(prefs.language);
			columnsStore.setFromBackend(prefs.columns);

			// Fetch user permissions from backend
			await fetchPermissions();

			// Fetch metadata (risk levels, statuses) from backend - non-critical, can fail silently
			fetchMetadata();

			appInitialized = true;
			initialized = true;
		} catch {
			initStarted = false; // Allow retry
			// Clear user session and redirect to login with error
			userStore.setUser(null);
			goto("/login?error=session_expired");
		}
	}

	// React to authentication changes - this handles login after page load
	$effect(() => {
		const isAuthenticated = userStore.isAuthenticated;

		if (isLoginPage) {
			// On login page, mark as ready for display but don't do app initialization
			initialized = true;
			return;
		}

		// Wait for session check to complete before deciding to redirect
		if (!sessionChecked) {
			return;
		}

		if (!isAuthenticated) {
			// Not authenticated and not on login page - redirect
			goto("/login");
			return;
		}

		// Authenticated and not on login page - initialize the app if not already done
		if (!appInitialized && !initStarted) {
			initializeApp();
		} else if (appInitialized && !initialized) {
			// Already initialized the app, just show the UI
			initialized = true;
		}
	});

	// Redirect on permission denial (for direct URL access)
	$effect(() => {
		if (initialized && !isLoginPage && permissionsStore.initialized && !hasRoutePermission) {
			goto("/");
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if isLoginPage}
	<!-- Minimal layout for login page -->
	<div class="min-h-screen bg-bg-dark">
		{@render children()}
	</div>
{:else if initialized && !hasRoutePermission}
	<!-- Access denied - will redirect via $effect -->
	<div class="min-h-screen bg-bg-dark flex items-center justify-center">
		<div class="text-center">
			<h1 class="text-2xl font-bold text-text mb-2">{m.access_denied()}</h1>
			<p class="text-text-muted mb-4">{m.access_denied_message()}</p>
			<Button onclick={() => goto("/")}>{m.access_goToDashboard()}</Button>
		</div>
	</div>
{:else if initialized}
	<!-- Full layout for authenticated pages -->
	<div class="min-h-screen bg-bg-dark flex flex-col">
		<Header
			{currentPage}
			onPageChange={handlePageChange}
			onSidebarToggle={() => (sidebarOpen = true)}
		/>

		<main class="flex-1">
			{@render children()}
		</main>

		<Footer />

		<Sidebar bind:open={sidebarOpen} onOpenChange={(open) => (sidebarOpen = open)} />

		<EntryEditModal />
		<Toast />
	</div>
{:else}
	<!-- Loading state while checking auth -->
	<div class="min-h-screen bg-bg-dark flex items-center justify-center">
		<div class="text-text-muted">Loading...</div>
	</div>
{/if}
