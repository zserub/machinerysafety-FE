import { createI18n } from "@inlang/paraglide-sveltekit";
import * as runtime from "$lib/paraglide/runtime";

export const i18n = createI18n(runtime, {
	// Use cookie-based strategy (no URL prefixes)
	prefixDefaultLanguage: "never",
	// Exclude paths from localization
	exclude: [/^\/api\//],
});
