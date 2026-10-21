import { dev } from "$app/environment";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { i18n } from "$lib/i18n";
import { apiLogger } from "$lib/utils/logger";

// In Docker: use service name "backend:8080"
// Locally: use "localhost:8080"
const API_PROXY_TARGET = process.env.PUBLIC_API_URL || "http://localhost:8080";

const apiProxy: Handle = async ({ event, resolve }) => {
	// In dev mode, let SvelteKit mock routes handle /api/* requests
	if (dev) {
		return resolve(event);
	}

	// In production, proxy /api/* requests to the backend
	if (event.url.pathname.startsWith("/api/")) {
		const targetUrl = `${API_PROXY_TARGET}${event.url.pathname}${event.url.search}`;

		try {
			const response = await fetch(targetUrl, {
				method: event.request.method,
				headers: event.request.headers,
				// Raw bytes, not text(): text() would corrupt binary bodies such as photo uploads
				body: event.request.method !== "GET" && event.request.method !== "HEAD"
					? await event.request.arrayBuffer()
					: undefined,
				redirect: "manual",
			});

			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			});
		} catch (error) {
			apiLogger.error("Proxy error:", error);
			return new Response(JSON.stringify({ error: "Backend unavailable" }), {
				status: 502,
				headers: { "Content-Type": "application/json" },
			});
		}
	}

	return resolve(event);
};

export const handle: Handle = sequence(apiProxy, i18n.handle());
