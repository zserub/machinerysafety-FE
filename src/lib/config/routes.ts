/** Route permission configuration */
export const routePermissions: Record<string, string | null> = {
	"/": "dashboard:view",
	"/table": "entries:view",
	"/stats": "statistics:view",
	"/add_risk": "entries:create",
	"/supviso": "supervisor_dashboard:view",
	"/settings": "settings:view",
	"/login": null, // No permission required
};

/**
 * Get required permission for a given path.
 * Returns null if no permission is required (e.g., login page).
 */
export function getRoutePermission(path: string): string | null {
	// Exact match first
	if (path in routePermissions) {
		return routePermissions[path];
	}

	// Check prefix matches (for potential nested routes)
	for (const [route, permission] of Object.entries(routePermissions)) {
		if (route !== "/" && path.startsWith(route + "/")) {
			return permission;
		}
	}

	// Default: require dashboard permission for unknown routes
	return "dashboard:view";
}
