/**
 * Draft storage utilities for form persistence.
 * - Text fields: localStorage (simple, synchronous)
 * - Images: IndexedDB (handles large files, async)
 */

import { storeLogger } from "./logger";

const DRAFT_KEY = "risk_create_draft";
const DB_NAME = "MachinerySafety";
const DB_VERSION = 1;
const STORE_NAME = "draft_images";

// ============================================
// LocalStorage - Text Fields
// ============================================

export interface DraftTextData {
	riskType: 1 | 2;
	linkedRiskId: string | null;
	machines: string;
	lineId: string;
	categoryId: string;
	dangerDescription: string;
	riskLevelId: string;
	action: string;
	responsibleId: string;
	notes: string;
	mocNumber: string;
	deadline: string;
	cost: number | null;
	expenseTypeId: string;
	savedAt: number; // timestamp
}

export function saveDraftText(data: Omit<DraftTextData, "savedAt">): void {
	try {
		const draft: DraftTextData = { ...data, savedAt: Date.now() };
		localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
	} catch (e) {
		storeLogger.warn("Failed to save draft to localStorage:", e);
	}
}

export function loadDraftText(): DraftTextData | null {
	try {
		const stored = localStorage.getItem(DRAFT_KEY);
		if (!stored) return null;

		const draft = JSON.parse(stored) as DraftTextData;

		// Expire drafts older than 7 days
		const sevenDays = 7 * 24 * 60 * 60 * 1000;
		if (Date.now() - draft.savedAt > sevenDays) {
			clearDraftText();
			return null;
		}

		return draft;
	} catch (e) {
		storeLogger.warn("Failed to load draft from localStorage:", e);
		return null;
	}
}

export function clearDraftText(): void {
	try {
		localStorage.removeItem(DRAFT_KEY);
	} catch (e) {
		storeLogger.warn("Failed to clear draft from localStorage:", e);
	}
}

// ============================================
// IndexedDB - Images
// ============================================

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
	if (dbPromise) return dbPromise;

	dbPromise = new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
			}
		};
	});

	return dbPromise;
}

export interface StoredImage {
	id?: number;
	name: string;
	type: string;
	data: ArrayBuffer;
	savedAt: number;
}

export async function saveDraftImages(files: File[]): Promise<void> {
	try {
		const db = await getDB();
		const tx = db.transaction(STORE_NAME, "readwrite");
		const store = tx.objectStore(STORE_NAME);

		// Clear existing images first
		store.clear();

		// Save each file
		for (const file of files) {
			const arrayBuffer = await file.arrayBuffer();
			const image: StoredImage = {
				name: file.name,
				type: file.type,
				data: arrayBuffer,
				savedAt: Date.now(),
			};
			store.add(image);
		}

		await new Promise<void>((resolve, reject) => {
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} catch (e) {
		storeLogger.warn("Failed to save images to IndexedDB:", e);
	}
}

export async function loadDraftImages(): Promise<File[]> {
	try {
		const db = await getDB();
		const tx = db.transaction(STORE_NAME, "readonly");
		const store = tx.objectStore(STORE_NAME);

		const images = await new Promise<StoredImage[]>((resolve, reject) => {
			const request = store.getAll();
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});

		// Convert back to Files
		const files: File[] = [];
		const sevenDays = 7 * 24 * 60 * 60 * 1000;

		for (const img of images) {
			// Skip expired images
			if (Date.now() - img.savedAt > sevenDays) continue;

			const blob = new Blob([img.data], { type: img.type });
			const file = new File([blob], img.name, { type: img.type });
			files.push(file);
		}

		return files;
	} catch (e) {
		storeLogger.warn("Failed to load images from IndexedDB:", e);
		return [];
	}
}

export async function clearDraftImages(): Promise<void> {
	try {
		const db = await getDB();
		const tx = db.transaction(STORE_NAME, "readwrite");
		const store = tx.objectStore(STORE_NAME);
		store.clear();

		await new Promise<void>((resolve, reject) => {
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} catch (e) {
		storeLogger.warn("Failed to clear images from IndexedDB:", e);
	}
}

// ============================================
// Combined Operations
// ============================================

export async function clearAllDrafts(): Promise<void> {
	clearDraftText();
	await clearDraftImages();
}

export function hasDraft(): boolean {
	return loadDraftText() !== null;
}
