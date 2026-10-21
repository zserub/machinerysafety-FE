import { api, ApiError } from "./client";
import { authLogger } from "$lib/utils/logger";
import type { User } from "$lib/stores/user.svelte";

export interface LoginCredentials {
	username: string;
	password: string;
}

// Backend response structure (differs from frontend User type)
interface LoginResponse {
	person_id: number;
	person_name: string;
	person_email: string;
	username: string;
	role_name: string;
	permissions?: string[];
}

export async function loginUser(credentials: LoginCredentials): Promise<User> {
	authLogger.debug("Attempting login", { username: credentials.username });
	const response = await api.post<LoginResponse>("/auth/login", credentials);

	const user: User = {
		id: String(response.person_id),
		username: response.username,
		displayName: response.person_name,
		email: response.person_email,
		role: mapRoleName(response.role_name),
	};
	authLogger.info(`Login successful: ${user.displayName} (${user.username})`);
	return user;
}

function mapRoleName(roleName: string): User["role"] {
	const normalized = roleName.toLowerCase();
	if (normalized === "admin") return "admin";
	if (normalized === "supervisor" || normalized === "manager") return "supervisor";
	return "worker";
}

export async function logoutUser(): Promise<void> {
	authLogger.debug("Logging out");
	await api.post<void>("/auth/logout");
	authLogger.info("Logout successful");
}

export async function getCurrentUser(): Promise<User | null> {
	authLogger.debug("Checking current user session");
	try {
		const response = await api.get<LoginResponse>("/auth/me");
		const user: User = {
			id: String(response.person_id),
			username: response.username,
			displayName: response.person_name,
			email: response.person_email,
			role: mapRoleName(response.role_name),
		};
		authLogger.info(`Session restored: ${user.displayName} (${user.username})`);
		return user;
	} catch (error) {
		// Session invalid or expired - user needs to log in
		if (error instanceof ApiError && error.status === 401) {
			authLogger.debug("No active session");
			return null;
		}
		authLogger.error("Failed to get current user", error);
		throw error;
	}
}

export { ApiError };
