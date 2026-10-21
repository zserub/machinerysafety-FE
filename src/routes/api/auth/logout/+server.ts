import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { setLoginState } from "../../_mock/data";

export const POST: RequestHandler = async () => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	setLoginState(false);
	return new Response(null, { status: 200 });
};
