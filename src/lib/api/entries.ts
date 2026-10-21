import { api, ApiError } from "./client";
import { apiLogger } from "$lib/utils/logger";
import type { Entry, RiskLevel, EntryStatus, EntryPhoto, EntryComment, RiskType, LinkedRiskSummary, EntryHistoryItem } from "$lib/types/entry";

const API_BASE_URL = "/api";

// Backend response types (PascalCase from Go)
interface BackendEntry {
	ID: number;
	RiskType: number; // 1 = short-term, 2 = long-term (only field using ID)
	LinkedRiskID: number | null;
	CreationDate: string;
	Machines: string;
	DangerDescription: string;
	Action: string | null;
	MOCNumber: number | null;
	Deadline: string | null;
	OriginalDeadline?: string | null;
	ImplementationDate: string | null;
	EntryModifiedAt: string;
	CommittedAt: string | null;
	Cost: number | null;
	// String fields (no IDs needed)
	Line: string;
	Category: string;
	RiskLevel: string;
	State: string;
	Responsible: string | null;
	CreatedBy: string;
	ExpenseType: string | null;
	// Nested objects
	LinkedRisk: BackendLinkedRisk | null;
	Photos: BackendPhoto[] | null;
	StatusHistory: BackendHistoryItem[] | null;
	DeadlineHistory: BackendHistoryItem[] | null;
	Postponements?: number;
}

interface BackendLinkedRisk {
	ID: number;
	Machines: string;
	Line: string;
	DangerDescription: string;
	RiskType: number;
}

interface BackendPhoto {
	ID: number;
	URL: string;
	Filename: string;
	UploadedAt: string;
}

interface BackendHistoryItem {
	ID: string;
	Timestamp: string;
	User: string;
	Action: string; // "created", "assigned", "postponed", "resolved", etc.
	Details?: string;
	Reason?: string;
}

interface BackendEntriesResponse {
	entries: BackendEntry[];
	total: number;
	page: number;
	pageSize: number;
}

// Helper: Extract YYYY-MM-DD from ISO datetime for HTML date inputs
function toDateOnly(isoDatetime: string | null): string {
	if (!isoDatetime) return "";
	return isoDatetime.split("T")[0];
}

// Helper: Normalize status values (OPEN → open, IN_PROGRESS → in-progress)
function normalizeStatus(status: string | null): string {
	return status?.toLowerCase().replace(/_/g, "-") ?? "";
}

// Helper: Convert status back to backend format (in-progress → IN_PROGRESS)
function toBackendStatus(status: string): string {
	return status.toUpperCase().replace(/-/g, "_");
}

// Map backend entry to frontend Entry type
function mapEntry(backend: BackendEntry): Entry {
	return {
		id: String(backend.ID),
		machine: backend.Machines,
		line: backend.Line,
		descriptionOfDanger: backend.DangerDescription,
		riskLevel: backend.RiskLevel?.toLowerCase() ?? "",
		action: backend.Action ?? "",
		deadline: toDateOnly(backend.Deadline),
		status: normalizeStatus(backend.State),
		responsible: backend.Responsible ?? "",
		moc: backend.MOCNumber ? String(backend.MOCNumber) : "",
		createdAt: backend.CreationDate,
		updatedAt: backend.EntryModifiedAt,
		cost: backend.Cost ?? 0,
		category: backend.Category?.toLowerCase() ?? "",
		additionalNotes: "",
		expenseType: backend.ExpenseType?.toLowerCase() ?? "",
		createdBy: backend.CreatedBy,
		originalDeadline: toDateOnly(backend.OriginalDeadline ?? backend.Deadline),
		postponements: backend.Postponements ?? 0,
		photos: (backend.Photos ?? []).map(mapPhoto),
		history: [
			...(backend.StatusHistory ?? []).map(mapHistoryItem),
			...(backend.DeadlineHistory ?? []).map(mapHistoryItem),
		].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
		riskType: backend.RiskType as RiskType,
		linkedRiskId: backend.LinkedRiskID ? String(backend.LinkedRiskID) : null,
		linkedRisk: backend.LinkedRisk ? mapLinkedRisk(backend.LinkedRisk) : null,
		implementationDate: toDateOnly(backend.ImplementationDate),
	};
}

function mapPhoto(backend: BackendPhoto): EntryPhoto {
	return {
		id: String(backend.ID),
		url: backend.URL,
		filename: backend.Filename,
		uploadedAt: backend.UploadedAt,
	};
}

function mapLinkedRisk(backend: BackendLinkedRisk): LinkedRiskSummary {
	return {
		id: String(backend.ID),
		machine: backend.Machines,
		line: backend.Line,
		descriptionOfDanger: backend.DangerDescription,
		riskType: backend.RiskType as RiskType,
	};
}

function mapHistoryItem(backend: BackendHistoryItem): EntryHistoryItem {
	return {
		id: backend.ID,
		timestamp: backend.Timestamp,
		user: backend.User,
		action: backend.Action.toLowerCase(),
		details: backend.Details,
		reason: backend.Reason,
	};
}

interface EntriesResponse {
	entries: Entry[];
	total: number;
	page: number;
	pageSize: number;
}

interface EntriesParams {
	page?: number;
	pageSize?: number;
	sortBy?: keyof Entry;
	sortOrder?: "asc" | "desc";
	status?: EntryStatus;
	riskLevel?: RiskLevel;
	search?: string;
}

interface CreateEntryData {
	// Required fields
	riskType: 1 | 2; // 1=short-term, 2=long-term
	machine: string;
	line: string;
	category: string;
	descriptionOfDanger: string;
	riskLevel: string;
	action: string;
	// Optional fields
	linkedRiskId?: string | null;
	responsible?: string | null;
	moc?: string | null;
	deadline?: string | null;
	cost?: number | null;
	expenseType?: string | null;
}

interface UpdateEntryData extends Partial<CreateEntryData> {
	status?: EntryStatus;
	implementationDate?: string | null;
	deadlineChangeReason?: string;
}

export const entriesApi = {
	async getAll(params: EntriesParams = {}): Promise<EntriesResponse> {
		const searchParams = new URLSearchParams();
		if (params.page) searchParams.set("page", String(params.page));
		if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
		if (params.sortBy) searchParams.set("sortBy", params.sortBy);
		if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
		if (params.status) searchParams.set("status", params.status);
		if (params.riskLevel) searchParams.set("riskLevel", params.riskLevel);
		if (params.search) searchParams.set("search", params.search);

		const query = searchParams.toString();
		const response = await api.get<BackendEntriesResponse>(`/entries${query ? `?${query}` : ""}`);

		return {
			entries: response.entries.map(mapEntry),
			total: response.total,
			page: response.page,
			pageSize: response.pageSize,
		};
	},

	async getById(id: string): Promise<Entry> {
		const response = await api.get<BackendEntry>(`/entries/${id}`);
		return mapEntry(response);
	},

	async create(data: CreateEntryData): Promise<Entry> {
		// Validate required string fields
		if (!data.line) {
			throw new ApiError(400, "line is required", { field: "line", value: data.line });
		}
		if (!data.category) {
			throw new ApiError(400, "category is required", { field: "category", value: data.category });
		}
		if (!data.riskLevel) {
			throw new ApiError(400, "riskLevel is required", { field: "riskLevel", value: data.riskLevel });
		}

		const payload = {
			riskType: data.riskType,
			machine: data.machine,
			line: data.line,
			category: data.category,
			descriptionOfDanger: data.descriptionOfDanger,
			riskLevel: data.riskLevel,
			action: data.action,
			linkedRiskId: data.linkedRiskId || null,
			responsible: data.responsible || null,
			moc: data.moc || null,
			deadline: data.deadline || null,
			cost: data.cost,
			expenseType: data.expenseType || null,
		};
		const response = await api.post<BackendEntry>("/entries", payload);
		return mapEntry(response);
	},

	async update(id: string, data: UpdateEntryData): Promise<Entry> {
		// Build payload with string values (only for fields that are present)
		const payload: Record<string, unknown> = {};
		if (data.riskType !== undefined) payload.riskType = data.riskType;
		if (data.machine !== undefined) payload.machine = data.machine;
		if (data.line !== undefined) payload.line = data.line;
		if (data.category !== undefined) payload.category = data.category;
		if (data.descriptionOfDanger !== undefined) payload.descriptionOfDanger = data.descriptionOfDanger;
		if (data.riskLevel !== undefined) payload.riskLevel = data.riskLevel;
		if (data.action !== undefined) payload.action = data.action;
		if (data.linkedRiskId !== undefined) payload.linkedRiskId = data.linkedRiskId || null;
		if (data.responsible !== undefined) payload.responsible = data.responsible || null;
		if (data.moc !== undefined) payload.moc = data.moc || null;
		if (data.deadline !== undefined) payload.deadline = data.deadline || null;
		if (data.cost !== undefined) payload.cost = data.cost;
		if (data.expenseType !== undefined) payload.expenseType = data.expenseType || null;
		if (data.status !== undefined) payload.status = toBackendStatus(data.status);
		if (data.implementationDate !== undefined) payload.implementationDate = data.implementationDate || null;
		if (data.deadlineChangeReason !== undefined) payload.deadlineChangeReason = data.deadlineChangeReason;
		const response = await api.patch<BackendEntry>(`/entries/${id}`, payload);
		return mapEntry(response);
	},

	async changeDeadline(id: string, newDeadline: string, reason?: string): Promise<Entry> {
		const payload: Record<string, unknown> = { deadline: newDeadline || null };
		if (reason !== undefined) payload.deadlineChangeReason = reason;
		const response = await api.patch<BackendEntry>(`/entries/${id}`, payload);
		return mapEntry(response);
	},

	async delete(id: string): Promise<void> {
		return api.delete(`/entries/${id}`);
	},

	async getMyEntries(params: EntriesParams = {}): Promise<EntriesResponse> {
		// Use the same endpoint as getAll - filtering by user is done client-side
		return this.getAll(params);
	},

	/**
	 * Uploads a photo to an entry.
	 * Uses multipart/form-data instead of JSON.
	 */
	async uploadPhoto(entryId: string, file: File): Promise<EntryPhoto> {
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch(`${API_BASE_URL}/entries/${entryId}/photos`, {
			method: "POST",
			body: formData,
			credentials: "include",
		});

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
				if (typeof data.error === "string") errorMessage = data.error;
				else if (typeof data.message === "string") errorMessage = data.message;
			}

			apiLogger.error(`POST /entries/${entryId}/photos failed`, {
				status: response.status,
				errorMessage,
				errorData,
				filename: file.name,
			});

			throw new ApiError(response.status, `Photo upload failed (${response.status}): ${errorMessage}`, errorData);
		}

		return response.json();
	},

	/**
	 * Deletes a photo from an entry.
	 */
	async deletePhoto(entryId: string, photoId: string): Promise<void> {
		await api.delete(`/entries/${entryId}/photos/${photoId}`);
	},

	/**
	 * Gets all comments for an entry.
	 */
	async getComments(entryId: string): Promise<EntryComment[]> {
		return api.get<EntryComment[]>(`/entries/${entryId}/comments`);
	},

	/**
	 * Adds a comment to an entry.
	 */
	async addComment(entryId: string, content: string): Promise<EntryComment> {
		return api.post<EntryComment>(`/entries/${entryId}/comments`, { content });
	},
};
