const defaultPermissions: string[] = ["dashboard:view"];

function createPermissionsStore() {
	let permissions = $state<string[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let initialized = $state(false);

	return {
		get permissions() {
			return permissions;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		get initialized() {
			return initialized;
		},

		/** Check if user has a specific permission (resource:action format) */
		has(permission: string): boolean {
			return permissions.includes(permission);
		},

		/** Check if user has permission for resource with action */
		can(resource: string, action: string): boolean {
			return permissions.includes(`${resource}:${action}`);
		},

		/** Check if user has any of the given permissions */
		hasAny(permissionList: string[]): boolean {
			return permissionList.some((p) => permissions.includes(p));
		},

		/** Check if user has all of the given permissions */
		hasAll(permissionList: string[]): boolean {
			return permissionList.every((p) => permissions.includes(p));
		},

		setPermissions(perms: string[]) {
			permissions = perms;
			initialized = true;
		},

		setLoading(isLoading: boolean) {
			loading = isLoading;
		},

		setError(err: string | null) {
			error = err;
		},

		reset() {
			permissions = [];
			initialized = false;
			error = null;
		},

		/** Initialize with minimal default permissions (used when API fails) */
		initWithDefaults() {
			permissions = defaultPermissions;
			initialized = true;
		},
	};
}

export const permissionsStore = createPermissionsStore();
