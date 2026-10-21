import type { Entry } from "$lib/types/entry";
import { entriesApi } from "$lib/api/entries";

/**
 * Deep clone an entry object using JSON serialization.
 * This handles Svelte reactive proxies that structuredClone cannot clone.
 */
function cloneEntry(e: Entry): Entry {
	return JSON.parse(JSON.stringify(e));
}

function createEntryEditStore() {
	let isOpen = $state(false);
	let entry = $state<Entry | null>(null);
	let originalEntry = $state<Entry | null>(null);
	let isSaving = $state(false);
	let isDeleting = $state(false);
	let isDirty = $state(false);
	let isLoading = $state(false);

	return {
		get isOpen() {
			return isOpen;
		},
		get entry() {
			return entry;
		},
		get originalEntry() {
			return originalEntry;
		},
		get isSaving() {
			return isSaving;
		},
		get isDeleting() {
			return isDeleting;
		},
		get isDirty() {
			return isDirty;
		},
		get isLoading() {
			return isLoading;
		},

		/**
		 * Opens the modal with the given entry for editing.
		 * Creates a deep clone to allow modifications without affecting original.
		 * Fetches full entry details (including history) from the API.
		 */
		async open(e: Entry) {
			originalEntry = cloneEntry(e);
			entry = cloneEntry(e);
			isOpen = true;
			isDirty = false;
			isLoading = true;

			try {
				const fullEntry = await entriesApi.getById(e.id);
				originalEntry = cloneEntry(fullEntry);
				entry = cloneEntry(fullEntry);
			} catch (error) {
				// Log error but keep modal open with partial data
				console.error("Failed to fetch full entry details:", error);
			} finally {
				isLoading = false;
			}
		},

		/**
		 * Closes the modal and resets state.
		 */
		close() {
			isOpen = false;
			entry = null;
			originalEntry = null;
			isDirty = false;
			isSaving = false;
			isDeleting = false;
			isLoading = false;
		},

		/**
		 * Marks the form as having unsaved changes.
		 */
		setDirty() {
			isDirty = true;
		},

		/**
		 * Sets the saving state (for showing loading indicator).
		 */
		setSaving(value: boolean) {
			isSaving = value;
		},

		/**
		 * Sets the deleting state (for showing loading indicator).
		 */
		setDeleting(value: boolean) {
			isDeleting = value;
		},

		/**
		 * Updates a single field on the entry being edited.
		 */
		updateField<K extends keyof Entry>(key: K, value: Entry[K]) {
			if (entry) {
				entry[key] = value;
				isDirty = true;
			}
		},

		/**
		 * Updates multiple fields at once.
		 */
		updateFields(updates: Partial<Entry>) {
			if (entry) {
				Object.assign(entry, updates);
				isDirty = true;
			}
		},

		/**
		 * Reverts changes to the original entry.
		 */
		revert() {
			if (originalEntry) {
				entry = cloneEntry(originalEntry);
				isDirty = false;
			}
		},

		/**
		 * After successful save, updates the original entry reference.
		 */
		markSaved(updatedEntry: Entry) {
			originalEntry = cloneEntry(updatedEntry);
			entry = cloneEntry(updatedEntry);
			isDirty = false;
			isSaving = false;
		},
	};
}

export const entryEditStore = createEntryEditStore();
