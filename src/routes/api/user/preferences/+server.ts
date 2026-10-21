import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// In-memory preferences storage
let preferences = {
	theme: "dark" as "dark" | "light",
	language: "en" as "en" | "hu",
};

export const GET: RequestHandler = async () => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	return json(preferences);
};

export const PATCH: RequestHandler = async ({ request }) => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	const body = await request.json();

	if (body.theme) {
		preferences.theme = body.theme;
	}
	if (body.language) {
		preferences.language = body.language;
	}

	return json(preferences);
};
