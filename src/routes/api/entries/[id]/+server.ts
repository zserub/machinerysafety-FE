import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getEntryById, updateEntry, deleteEntry } from "../../_mock/data";

export const GET: RequestHandler = async ({ params }) => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	const id = parseInt(params.id);
	const entry = getEntryById(id);

	if (!entry) {
		return json({ error: "Entry not found" }, { status: 404 });
	}

	return json(entry);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	const id = parseInt(params.id);
	const body = await request.json();

	const updated = updateEntry(id, {
		...body,
		EntryModifiedAt: new Date().toISOString(),
	});

	if (!updated) {
		return json({ error: "Entry not found" }, { status: 404 });
	}

	return json(updated);
};

export const DELETE: RequestHandler = async ({ params }) => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	const id = parseInt(params.id);
	const deleted = deleteEntry(id);

	if (!deleted) {
		return json({ error: "Entry not found" }, { status: 404 });
	}

	return new Response(null, { status: 204 });
};
