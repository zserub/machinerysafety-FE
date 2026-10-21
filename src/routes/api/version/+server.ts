import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	return json({ version: "dev-mock" });
};
