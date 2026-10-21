import { api } from "./client";
import { metadataStore } from "$lib/stores/metadata.svelte";
import type { RiskLevelOption, StatusOption, CategoryOption, ExpenseTypeOption, LineOption, ResponsibleOption } from "$lib/types/entry";
import { apiLogger } from "$lib/utils/logger";

interface MetadataResponse {
	riskLevels?: RiskLevelOption[];
	statuses?: StatusOption[];
	categories?: CategoryOption[];
	expenseTypes?: ExpenseTypeOption[];
	lines?: LineOption[];
	responsibles?: ResponsibleOption[];
}

/**
 * Fetch metadata from the backend
 * This should be called on app initialization
 * Falls back to defaults if any field is missing
 */
export async function fetchMetadata(): Promise<void> {
	metadataStore.setLoading(true);
	metadataStore.setError(null);

	try {
		const data = await api.get<MetadataResponse>("/metadata");

		if (data.riskLevels && data.riskLevels.length > 0) {
			metadataStore.setRiskLevels(data.riskLevels);
		}

		if (data.statuses && data.statuses.length > 0) {
			metadataStore.setStatuses(data.statuses);
		}

		if (data.categories && data.categories.length > 0) {
			metadataStore.setCategories(data.categories);
		}

		if (data.expenseTypes && data.expenseTypes.length > 0) {
			metadataStore.setExpenseTypes(data.expenseTypes);
		}

		if (data.lines && data.lines.length > 0) {
			metadataStore.setLines(data.lines);
		}

		if (data.responsibles && data.responsibles.length > 0) {
			metadataStore.setResponsibles(data.responsibles);
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to fetch metadata";
		metadataStore.setError(message);
		apiLogger.warn("Failed to fetch metadata, using defaults:", message);
		// Keep using default values - they're already set in the store
	} finally {
		metadataStore.setLoading(false);
	}
}

/**
 * Fetch only risk levels
 */
export async function fetchRiskLevels(): Promise<RiskLevelOption[]> {
	try {
		const data = await api.get<{ riskLevels: RiskLevelOption[] }>("/metadata/risk-levels");
		if (data.riskLevels && data.riskLevels.length > 0) {
			metadataStore.setRiskLevels(data.riskLevels);
		}
		return metadataStore.riskLevels;
	} catch (error) {
		apiLogger.warn("Failed to fetch risk levels, using defaults");
		return metadataStore.riskLevels;
	}
}

/**
 * Fetch only statuses
 */
export async function fetchStatuses(): Promise<StatusOption[]> {
	try {
		const data = await api.get<{ statuses: StatusOption[] }>("/metadata/statuses");
		if (data.statuses && data.statuses.length > 0) {
			metadataStore.setStatuses(data.statuses);
		}
		return metadataStore.statuses;
	} catch (error) {
		apiLogger.warn("Failed to fetch statuses, using defaults");
		return metadataStore.statuses;
	}
}
