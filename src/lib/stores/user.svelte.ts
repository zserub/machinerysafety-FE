import { loginUser, logoutUser, getCurrentUser, type LoginCredentials } from "$lib/api/auth";
import { permissionsStore } from "$lib/stores/permissions.svelte";

export interface User {
	id: string;
	username: string;
	displayName: string;
	email: string;
	role: "worker" | "supervisor" | "admin";
}

function createUserStore() {
	let user = $state<User | null>(null);
	let loading = $state(false);

	// Mock user for development
	const mockUser: User = {
		id: "1",
		username: "devuser",
		displayName: "Dev User",
		email: "dev@example.com",
		role: "admin",
	};

	return {
		get user() {
			return user;
		},
		get loading() {
			return loading;
		},
		get isAuthenticated() {
			return user !== null;
		},
		get username() {
			return user?.username ?? "Guest";
		},
		get displayName() {
			return user?.displayName ?? user?.username ?? "Guest";
		},
		get userId() {
			return user?.id ?? null;
		},
		async login() {
			loading = true;
			// TODO: Replace with actual API call
			await new Promise((resolve) => setTimeout(resolve, 100));
			user = mockUser;
			loading = false;
		},
		async loginWithCredentials(credentials: LoginCredentials) {
			loading = true;
			try {
				const loggedInUser = await loginUser(credentials);
				user = loggedInUser;
			} finally {
				loading = false;
			}
		},
		async logout() {
			loading = true;
			try {
				await logoutUser();
			} finally {
				user = null;
				permissionsStore.reset();
				loading = false;
			}
		},
		setUser(newUser: User | null) {
			user = newUser;
		},
		async restoreSession(): Promise<boolean> {
			loading = true;
			try {
				const restoredUser = await getCurrentUser();
				user = restoredUser;
				return restoredUser !== null;
			} catch {
				user = null;
				return false;
			} finally {
				loading = false;
			}
		},
	};
}

export const userStore = createUserStore();
