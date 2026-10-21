<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { userStore } from "$lib/stores/user.svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { ApiError } from "$lib/api/auth";
	import * as m from "$lib/paraglide/messages";

	let username = $state("");
	let password = $state("");
	let error = $state("");

	// Check for redirect error param (e.g., session expired)
	let redirectError = $derived($page.url.searchParams.get("error"));

	// Handle redirect error param on mount
	$effect(() => {
		if (redirectError === "session_expired") {
			error = m.login_sessionExpired();
			// Clear the param from URL without triggering navigation
			goto("/login", { replaceState: true });
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = "";

		if (!username.trim() || !password.trim()) {
			error = m.login_error();
			return;
		}

		try {
			await userStore.loginWithCredentials({ username, password });
			await goto("/");
		} catch (err) {
			if (err instanceof ApiError) {
				if (err.status === 0) {
					// Network error or timeout
					error = m.login_networkError();
				} else {
					// API responded with an error (invalid credentials, etc.)
					error = m.login_error();
				}
			} else {
				// Unexpected error
				error = m.login_networkError();
			}
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="w-full max-w-sm">
		<!-- Logo/Title -->
		<div class="text-center mb-8">
			<h1 class="text-2xl font-bold text-text">{m.appName()}</h1>
		</div>

		<!-- Login Card -->
		<div class="bg-bg rounded-lg border-2 border-border p-6">
			<h2 class="text-lg font-semibold text-text mb-6">{m.login_title()}</h2>

			<form onsubmit={handleSubmit} class="space-y-4">
				<!-- Username -->
				<div class="space-y-2">
					<label for="username" class="block text-sm font-medium text-text">
						{m.login_username()}
					</label>
					<input
						id="username"
						type="text"
						bind:value={username}
						autocomplete="username"
						class="w-full h-10 px-3 bg-bg-light border-2 border-border rounded-md text-text placeholder:text-text-muted focus:outline-none focus:border-highlight transition-colors"
					/>
				</div>

				<!-- Password -->
				<div class="space-y-2">
					<label for="password" class="block text-sm font-medium text-text">
						{m.login_password()}
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						autocomplete="current-password"
						class="w-full h-10 px-3 bg-bg-light border-2 border-border rounded-md text-text placeholder:text-text-muted focus:outline-none focus:border-highlight transition-colors"
					/>
				</div>

				<!-- Error Message -->
				{#if error}
					<p class="text-sm text-danger">{error}</p>
				{/if}

				<!-- Submit Button -->
				<Button type="submit" class="w-full" disabled={userStore.loading}>
					{#if userStore.loading}
						{m.login_loading()}
					{:else}
						{m.login_submit()}
					{/if}
				</Button>
			</form>
		</div>
	</div>
</div>
