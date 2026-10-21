import { browser } from "$app/environment";
import { type ColumnConfig, defaultColumns } from "$lib/types/entry";
import { storeLogger } from "$lib/utils/logger";
import { updateColumns } from "$lib/api/preferences";

const STORAGE_KEY_PREFIX = "column-visibility";
const DEBOUNCE_MS = 500;

function getStorageKey(userId: string | null): string {
	return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : STORAGE_KEY_PREFIX;
}

function getStoredColumns(userId: string | null): Record<string, boolean> | null {
	if (browser) {
		const stored = localStorage.getItem(getStorageKey(userId));
		if (stored) {
			try {
				return JSON.parse(stored) as Record<string, boolean>;
			} catch {
				// Invalid JSON
			}
		}
	}
	return null;
}

function createColumnsStore() {
	let columns = $state<ColumnConfig[]>(structuredClone(defaultColumns));
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let isSaving = $state(false);
	let userId: string | null = null;

	function saveToLocalStorage() {
		if (browser) {
			const visibility: Record<string, boolean> = {};
			for (const col of columns) {
				visibility[col.key] = col.visible;
			}
			localStorage.setItem(getStorageKey(userId), JSON.stringify(visibility));
		}
	}

	async function saveToApi() {
		isSaving = true;
		try {
			const visibility: Record<string, boolean> = {};
			for (const col of columns) {
				visibility[col.key] = col.visible;
			}
			await updateColumns(visibility);
		} catch {
			// Failed to save column settings - silently ignore, localStorage is fallback
		} finally {
			isSaving = false;
		}
	}

	function debouncedSave() {
		saveToLocalStorage();
		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}
		saveTimeout = setTimeout(() => {
			saveToApi();
			saveTimeout = null;
		}, DEBOUNCE_MS);
	}

	return {
		get columns() {
			return columns;
		},
		get visibleColumns() {
			return columns.filter((col) => col.visible);
		},
		get isSaving() {
			return isSaving;
		},
		/**
		 * Initialize the store for a specific user.
		 * Loads column visibility from user-scoped localStorage.
		 */
		initForUser(newUserId: string | null) {
			userId = newUserId;
			const stored = getStoredColumns(newUserId);
			if (stored) {
				columns = structuredClone(defaultColumns).map((col) => ({
					...col,
					visible: stored[col.key] ?? col.defaultVisible,
				}));
			} else {
				// Reset to defaults for new user
				columns = structuredClone(defaultColumns);
			}
		},
		toggleColumn(key: string) {
			const col = columns.find((c) => c.key === key);
			if (col) {
				col.visible = !col.visible;
				debouncedSave();
			}
		},
		setColumnVisibility(key: string, visible: boolean) {
			const col = columns.find((c) => c.key === key);
			if (col) {
				col.visible = visible;
				debouncedSave();
			}
		},
		resetToDefaults() {
			for (const col of columns) {
				col.visible = col.defaultVisible;
			}
			debouncedSave();
		},
		showAll() {
			for (const col of columns) {
				col.visible = true;
			}
			debouncedSave();
		},
		hideAll() {
			for (const col of columns) {
				col.visible = false;
			}
			debouncedSave();
		},
		/**
		 * Apply column visibility from backend preferences.
		 * Called during app initialization after fetching preferences.
		 * Does not trigger API sync (avoids write-back loop).
		 */
		setFromBackend(columnVisibility: Record<string, boolean> | undefined) {
			if (!columnVisibility) return;
			columns = structuredClone(defaultColumns).map((col) => ({
				...col,
				visible: columnVisibility[col.key] ?? col.defaultVisible,
			}));
			// Save to localStorage for offline access
			saveToLocalStorage();
		},
	};
}

export const columnsStore = createColumnsStore();
