import { apiLogger } from "$lib/utils/logger";

const API_BASE_URL = "/api";

interface RequestOptions {
	method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	body?: unknown;
	headers?: Record<string, string>;
}

class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
		public data?: unknown
	) {
		super(message);
		this.name = "ApiError";
	}

	/**
	 * Get a user-friendly error message, preferring backend error if available
	 */
	getUserMessage(): string {
		if (this.data && typeof this.data === "object") {
			const errorData = this.data as Record<string, unknown>;
			// Try common error message fields from backend
			if (typeof errorData.error === "string") return errorData.error;
			if (typeof errorData.message === "string") return errorData.message;
			if (typeof errorData.detail === "string") return errorData.detail;
		}
		return this.message;
	}
}

const REQUEST_TIMEOUT_MS = 10000; // 10 second timeout

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
	const { method = "GET", body, headers = {} } = options;

	apiLogger.debug(`${method} ${endpoint}`, body ? { body } : "");

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	const config: RequestInit = {
		method,
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
		credentials: "include", // Include cookies for auth
		signal: controller.signal,
	};

	if (body) {
		config.body = JSON.stringify(body);
	}

	let response: Response;
	try {
		response = await fetch(`${API_BASE_URL}${endpoint}`, config);
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error && error.name === "AbortError") {
			apiLogger.error(`${method} ${endpoint} - timeout`);
			throw new ApiError(0, "Request timeout - server not responding");
		}
		apiLogger.error(`${method} ${endpoint} - network error`);
		throw new ApiError(0, "Network error - unable to reach server");
	} finally {
		clearTimeout(timeoutId);
	}

	if (!response.ok) {
		let errorData;
		try {
			errorData = await response.json();
		} catch {
			errorData = null;
		}

		// Extract error message from backend response
		let errorMessage = response.statusText || `HTTP ${response.status}`;
		if (errorData && typeof errorData === "object") {
			const data = errorData as Record<string, unknown>;
			// Try common error message fields from backend
			if (typeof data.error === "string") errorMessage = data.error;
			else if (typeof data.message === "string") errorMessage = data.message;
			else if (typeof data.detail === "string") errorMessage = data.detail;
		}

		apiLogger.error(`${method} ${endpoint} failed`, {
			status: response.status,
			statusText: response.statusText,
			errorMessage,
			errorData,
			requestBody: body,
		});

		throw new ApiError(response.status, `API Error (${response.status}): ${errorMessage}`, errorData);
	}

	apiLogger.debug(`${method} ${endpoint} - ${response.status} OK`);

	// Handle empty responses
	const text = await response.text();
	if (!text) {
		return {} as T;
	}

	return JSON.parse(text) as T;
}

export const api = {
	get<T>(endpoint: string, headers?: Record<string, string>) {
		return request<T>(endpoint, { method: "GET", headers });
	},
	post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>) {
		return request<T>(endpoint, { method: "POST", body, headers });
	},
	put<T>(endpoint: string, body?: unknown, headers?: Record<string, string>) {
		return request<T>(endpoint, { method: "PUT", body, headers });
	},
	patch<T>(endpoint: string, body?: unknown, headers?: Record<string, string>) {
		return request<T>(endpoint, { method: "PATCH", body, headers });
	},
	delete<T>(endpoint: string, headers?: Record<string, string>) {
		return request<T>(endpoint, { method: "DELETE", headers });
	},
};

export { ApiError };
