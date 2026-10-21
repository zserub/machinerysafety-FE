import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async () => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	// Mock delete - just return success
	return new Response(null, { status: 204 });
};
