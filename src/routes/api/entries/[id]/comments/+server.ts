import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// In-memory comments storage
const commentsStore: Record<string, Array<{
	id: string;
	riskId: string;
	authorId: string;
	authorName: string;
	content: string;
	createdAt: string;
}>> = {};

export const GET: RequestHandler = async ({ params }) => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	const comments = commentsStore[params.id] || [];
	return json(comments);
};

export const POST: RequestHandler = async ({ params, request }) => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	const body = await request.json();
	const comment = {
		id: `comment-${Date.now()}`,
		riskId: params.id,
		authorId: "dev-user",
		authorName: "Dev User",
		content: body.content,
		createdAt: new Date().toISOString(),
	};

	if (!commentsStore[params.id]) {
		commentsStore[params.id] = [];
	}
	commentsStore[params.id].push(comment);

	return json(comment, { status: 201 });
};
