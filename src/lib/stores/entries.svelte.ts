import { entriesApi } from "$lib/api/entries";
import { userStore } from "$lib/stores/user.svelte";
import { storeLogger } from "$lib/utils/logger";
import type { Entry, RiskLevel, EntryStatus } from "$lib/types/entry";

export interface EntriesParams {
	page?: number;
	pageSize?: number;
	sortBy?: keyof Entry;
	sortOrder?: "asc" | "desc";
	status?: EntryStatus;
	riskLevel?: RiskLevel;
	search?: string;
}

function createEntriesStore() {
	let entries = $state<Entry[]>([]);
	let total = $state(0);
	let page = $state(1);
	let pageSize = $state(10);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let currentParams = $state<EntriesParams>({});
	let lastFetchMode = $state<"all" | "my">("all");

	return {
		get entries() {
			return entries;
		},
		get total() {
			return total;
		},
		get page() {
			return page;
		},
		get pageSize() {
			return pageSize;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		get params() {
			return currentParams;
		},

		async fetchAll(params: EntriesParams = {}) {
			storeLogger.debug("Fetching all entries", params);
			loading = true;
			error = null;
			currentParams = params;
			lastFetchMode = "all";
			try {
				const response = await entriesApi.getAll(params);
				entries = response.entries;
				total = response.total;
				page = response.page;
				pageSize = response.pageSize;
				storeLogger.info(`Loaded ${entries.length} entries (total: ${total})`);
			} catch (e) {
				error = e instanceof Error ? e.message : "Failed to load entries";
				storeLogger.error("Failed to fetch entries", e);
				throw e;
			} finally {
				loading = false;
			}
		},

		async fetchMyEntries(params: EntriesParams = {}) {
			storeLogger.debug("Fetching my entries", params);
			loading = true;
			error = null;
			currentParams = params;
			lastFetchMode = "my";
			try {
				const response = await entriesApi.getMyEntries(params);
				// Filter entries by current user's display name (client-side filtering)
				const displayName = userStore.displayName;
				storeLogger.debug(`Filtering entries for user: "${displayName}"`);
				const myEntries = response.entries.filter(
					(entry) => entry.responsible === displayName
				);
				entries = myEntries;
				total = myEntries.length;
				page = 1;
				pageSize = myEntries.length;
				storeLogger.info(`Found ${myEntries.length} entries for user "${displayName}"`);
			} catch (e) {
				error = e instanceof Error ? e.message : "Failed to load entries";
				storeLogger.error("Failed to fetch my entries", e);
				throw e;
			} finally {
				loading = false;
			}
		},

		async invalidate() {
			if (lastFetchMode === "my") {
				await this.fetchMyEntries(currentParams);
			} else {
				await this.fetchAll(currentParams);
			}
		},

		clear() {
			entries = [];
			total = 0;
			page = 1;
			pageSize = 10;
			error = null;
			currentParams = {};
		},

		setError(err: string | null) {
			error = err;
		},
	};
}

export const entriesStore = createEntriesStore();
