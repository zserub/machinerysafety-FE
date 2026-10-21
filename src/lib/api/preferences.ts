import { browser } from "$app/environment";
import { api, ApiError } from "./client";
import { userStore } from "$lib/stores/user.svelte";
import type { Theme } from "$lib/stores/theme.svelte";
import type { Language } from "$lib/stores/language.svelte";
import { apiLogger } from "$lib/utils/logger";

export interface UserPreferences {
	theme: Theme;
	language: Language;
	columns?: Record<string, boolean>;
}

/**
 * Gets preferences from localStorage (used as fallback when API fails).
 * Uses user-scoped keys when a user is logged in.
 */
function getLocalPreferences(): UserPreferences {
	if (browser) {
		const userId = userStore.userId;
		const themeKey = userId ? `theme-${userId}` : "theme";
		const languageKey = userId ? `language-${userId}` : "language";
		const columnsKey = userId ? `column-visibility-${userId}` : "column-visibility";

		const theme = localStorage.getItem(themeKey) as Theme | null;
		const language = localStorage.getItem(languageKey) as Language | null;
		let columns: Record<string, boolean> | undefined;
		try {
			const storedColumns = localStorage.getItem(columnsKey);
			if (storedColumns) {
				columns = JSON.parse(storedColumns) as Record<string, boolean>;
			}
		} catch {
			// Invalid JSON, ignore
		}
		return {
			theme: theme === "dark" || theme === "light" ? theme : "dark",
			language: language === "en" || language === "hu" ? language : "en",
			columns,
		};
	}
	return { theme: "dark", language: "en" };
}

/**
 * Fetches user preferences from the backend.
 * Falls back to localStorage values if API fails.
 */
export async function getPreferences(): Promise<UserPreferences> {
	try {
		return await api.get<UserPreferences>("/user/preferences");
	} catch (error) {
		if (error instanceof ApiError) {
			apiLogger.warn("Failed to fetch preferences, using local storage:", error.message);
		}
		// Fall back to localStorage instead of hardcoded defaults
		return getLocalPreferences();
	}
}

/**
 * Updates user preferences on the backend.
 * Returns the updated preferences or null if failed.
 */
export async function updatePreferences(
	preferences: Partial<UserPreferences>
): Promise<UserPreferences | null> {
	try {
		return await api.patch<UserPreferences>("/user/preferences", preferences);
	} catch (error) {
		if (error instanceof ApiError) {
			apiLogger.warn("Failed to update preferences:", error.message);
		}
		return null;
	}
}

/**
 * Updates a single preference value on the backend.
 */
export async function updateTheme(theme: Theme): Promise<boolean> {
	const result = await updatePreferences({ theme });
	return result !== null;
}

/**
 * Updates the language preference on the backend.
 */
export async function updateLanguage(language: Language): Promise<boolean> {
	const result = await updatePreferences({ language });
	return result !== null;
}

/**
 * Updates the column visibility preferences on the backend.
 */
export async function updateColumns(columns: Record<string, boolean>): Promise<boolean> {
	const result = await updatePreferences({ columns });
	return result !== null;
}
