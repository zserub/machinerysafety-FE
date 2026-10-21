import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ params }) => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	// Mock photo upload - just return a fake photo object
	const photo = {
		id: `photo-${Date.now()}`,
		url: `/mock-photos/${params.id}/${Date.now()}.jpg`,
		filename: "uploaded-photo.jpg",
		uploadedAt: new Date().toISOString(),
	};

	return json(photo, { status: 200 });
};
