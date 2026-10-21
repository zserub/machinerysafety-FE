import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { mockUser, setLoginState } from "../../_mock/data";

export const POST: RequestHandler = async ({ request }) => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	const body = await request.json();
	const { username, password } = body;

	// Accept any non-empty credentials in dev mode
	if (!username || !password) {
		return json({ error: "invalid_credentials", message: "Username and password required" }, { status: 401 });
	}

	// Set logged in state
	setLoginState(true);

	// Return mock user - always use "devuser" to match mock entries
	// This ensures the dashboard shows entries assigned to this user
	return json(mockUser);
};
