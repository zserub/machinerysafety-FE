import { api, ApiError } from "./client";
import { permissionsStore } from "$lib/stores/permissions.svelte";

interface PermissionsResponse {
	permissions: string[];
}

/**
 * Fetches user permissions from the backend.
 * Should be called after successful authentication.
 * Falls back to minimal permissions if API fails.
 */
export async function fetchPermissions(): Promise<void> {
	permissionsStore.setLoading(true);
	permissionsStore.setError(null);

	try {
		const data = await api.get<PermissionsResponse>("/user/permissions");

		if (data.permissions && data.permissions.length > 0) {
			permissionsStore.setPermissions(data.permissions);
		} else {
			// Empty permissions from API - use defaults
			permissionsStore.initWithDefaults();
		}
	} catch (error) {
		const message = error instanceof ApiError ? error.message : "Failed to fetch permissions";
		permissionsStore.setError(message);
		// Fall back to minimal permissions
		permissionsStore.initWithDefaults();
	} finally {
		permissionsStore.setLoading(false);
	}
}
