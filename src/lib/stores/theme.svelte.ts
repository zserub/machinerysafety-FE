import { browser } from "$app/environment";
import { updateTheme } from "$lib/api/preferences";

export type Theme = "dark" | "light";

function getStorageKey(userId: string | null): string {
	return userId ? `theme-${userId}` : "theme";
}

function getStoredTheme(userId: string | null): Theme | null {
	if (browser) {
		const stored = localStorage.getItem(getStorageKey(userId)) as Theme | null;
		if (stored === "dark" || stored === "light") {
			return stored;
		}
	}
	return null;
}

function updateBodyClass(newTheme: Theme) {
	if (browser) {
		if (newTheme === "light") {
			document.body.classList.add("light");
		} else {
			document.body.classList.remove("light");
		}
	}
}

class ThemeStore {
	#theme = $state<Theme>("dark");
	#userId: string | null = null;

	constructor() {
		// Apply initial theme class inside effect to avoid capturing issue
		$effect.root(() => {
			updateBodyClass(this.#theme);
		});
	}

	get value(): Theme {
		return this.#theme;
	}

	set value(newTheme: Theme) {
		this.#theme = newTheme;
		if (browser) {
			localStorage.setItem(getStorageKey(this.#userId), newTheme);
			updateBodyClass(newTheme);
			// Sync to backend (fire and forget)
			updateTheme(newTheme);
		}
	}

	toggle() {
		const newTheme = this.#theme === "dark" ? "light" : "dark";
		this.#theme = newTheme;
		if (browser) {
			localStorage.setItem(getStorageKey(this.#userId), newTheme);
			updateBodyClass(newTheme);
			// Sync to backend (fire and forget)
			updateTheme(newTheme);
		}
	}

	/**
	 * Initialize the store for a specific user.
	 * Loads theme from user-scoped localStorage.
	 */
	initForUser(userId: string | null) {
		this.#userId = userId;
		const stored = getStoredTheme(userId);
		if (stored) {
			this.#theme = stored;
			updateBodyClass(stored);
		}
	}

	/**
	 * Set theme from backend preferences (used during app initialization).
	 * This updates both state and localStorage without triggering a backend sync.
	 */
	setFromBackend(theme: Theme) {
		this.#theme = theme;
		if (browser) {
			localStorage.setItem(getStorageKey(this.#userId), theme);
			updateBodyClass(theme);
		}
	}
}

export const themeStore = new ThemeStore();
