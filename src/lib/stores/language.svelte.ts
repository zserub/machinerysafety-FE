import { browser } from "$app/environment";
import { setLanguageTag, languageTag, type AvailableLanguageTag } from "$lib/paraglide/runtime";
import { updateLanguage } from "$lib/api/preferences";
import * as m from "$lib/paraglide/messages";

export type Language = AvailableLanguageTag;

export const languages: { code: Language; getName: () => string }[] = [
	{ code: "en", getName: () => m.languages_en() },
	{ code: "hu", getName: () => m.languages_hu() },
];

function getStorageKey(userId: string | null): string {
	return userId ? `language-${userId}` : "language";
}

function getStoredLanguage(userId: string | null): Language | null {
	if (browser) {
		const stored = localStorage.getItem(getStorageKey(userId)) as Language | null;
		if (stored && languages.some((l) => l.code === stored)) {
			return stored;
		}
	}
	return null;
}

function createLanguageStore() {
	let language = $state<Language>("en");
	let userId: string | null = null;

	return {
		get value() {
			return language;
		},
		set value(newLanguage: Language) {
			language = newLanguage;
			setLanguageTag(newLanguage);
			if (browser) {
				localStorage.setItem(getStorageKey(userId), newLanguage);
				// Set cookie for server-side detection
				document.cookie = `paraglide_lang=${newLanguage};path=/;max-age=31536000`;
				// Sync to backend (fire and forget)
				updateLanguage(newLanguage);
				// Reload to apply translations
				window.location.reload();
			}
		},
		/**
		 * Initialize the store for a specific user.
		 * Loads language from user-scoped localStorage.
		 */
		initForUser(newUserId: string | null) {
			userId = newUserId;
			const stored = getStoredLanguage(newUserId);
			if (stored) {
				language = stored;
				setLanguageTag(stored);
				document.cookie = `paraglide_lang=${stored};path=/;max-age=31536000`;
			}
		},
		/**
		 * Set language from backend preferences (used during app initialization).
		 * This updates state, localStorage, and cookie without triggering a backend sync.
		 * Note: We avoid reloading here since it would lose client-side auth state.
		 * The language will be fully applied on the next page navigation/reload.
		 */
		setFromBackend(newLanguage: Language) {
			if (!languages.some((l) => l.code === newLanguage)) {
				return; // Invalid language, skip
			}
			language = newLanguage;
			setLanguageTag(newLanguage);
			if (browser) {
				localStorage.setItem(getStorageKey(userId), newLanguage);
				document.cookie = `paraglide_lang=${newLanguage};path=/;max-age=31536000`;
				// Note: We intentionally don't reload here to preserve auth state.
				// Paraglide's setLanguageTag should update translations immediately.
			}
		},
		getName() {
			const lang = languages.find((l) => l.code === language);
			return lang?.getName() ?? "English";
		},
		getCurrentTag() {
			return languageTag();
		},
	};
}

export const languageStore = createLanguageStore();
