import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { mockUser, getLoginState } from "../../_mock/data";

export const GET: RequestHandler = async () => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	// Check if logged in
	if (!getLoginState()) {
		return json({ error: "not_authenticated" }, { status: 401 });
	}

	return json(mockUser);
};
