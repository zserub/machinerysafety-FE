import type { EntryPhoto } from "$lib/types/entry";
import { metadataStore } from "./metadata.svelte";
import {
	saveDraftText,
	loadDraftText,
	clearDraftText,
	saveDraftImages,
	loadDraftImages,
	clearDraftImages,
	clearAllDrafts,
	type DraftTextData,
} from "$lib/utils/draftStorage";
import { storeLogger } from "$lib/utils/logger";

// Risk type enum matching backend
export type RiskType = 1 | 2; // 1=short-term (temporary), 2=long-term (permanent)

// Linked risk summary for display
export interface LinkedRiskSummary {
	id: string;
	machine: string;
	line: string;
	descriptionOfDanger: string;
	riskType: RiskType;
}

// Form data structure matching ER diagram
export interface RiskCreateData {
	riskType: RiskType;
	linkedRiskId: string | null;
	linkedRisk: LinkedRiskSummary | null;
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
	photos: File[];
	photoUrls: string[]; // Preview URLs for uploaded photos
}

// Wizard step definitions
export const WIZARD_STEPS = [
	{ id: "location", labelKey: "wizard_stepLocation" },
	{ id: "risk", labelKey: "wizard_stepRisk" },
	{ id: "assignment", labelKey: "wizard_stepAssignment" },
	{ id: "optional", labelKey: "wizard_stepOptional" },
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number]["id"];

function getDefaultFormData(): RiskCreateData {
	return {
		riskType: 2, // Default to long-term/permanent
		linkedRiskId: null,
		linkedRisk: null,
		machines: "",
		lineId: metadataStore.lines[0]?.value ?? "",
		categoryId: metadataStore.categories[0]?.value ?? "",
		dangerDescription: "",
		riskLevelId: "medium",
		action: "",
		responsibleId: "",
		notes: "",
		mocNumber: "",
		deadline: getDefaultDeadline(),
		cost: null,
		expenseTypeId: "",
		photos: [],
		photoUrls: [],
	};
}

function getDefaultDeadline(): string {
	const date = new Date();
	date.setDate(date.getDate() + 30); // 30 days from now
	return date.toISOString().split("T")[0];
}

// Debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
	let timeoutId: ReturnType<typeof setTimeout>;
	return ((...args: any[]) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), ms);
	}) as T;
}

function createRiskCreateStore() {
	let currentStep = $state(0);
	let formData = $state<RiskCreateData>(getDefaultFormData());
	let validationErrors = $state<Record<string, string>>({});
	let isSubmitting = $state(false);
	let isLinkModalOpen = $state(false);
	let draftRestored = $state(false);
	let draftLoading = $state(false);

	// Derived state
	const isFirstStep = $derived(currentStep === 0);
	const isLastStep = $derived(currentStep === WIZARD_STEPS.length - 1);
	const currentStepId = $derived(WIZARD_STEPS[currentStep].id);
	const progress = $derived(((currentStep + 1) / WIZARD_STEPS.length) * 100);

	// Debounced save functions
	const debouncedSaveText = debounce(() => {
		const textData: Omit<DraftTextData, "savedAt"> = {
			riskType: formData.riskType,
			linkedRiskId: formData.linkedRiskId,
			machines: formData.machines,
			lineId: formData.lineId,
			categoryId: formData.categoryId,
			dangerDescription: formData.dangerDescription,
			riskLevelId: formData.riskLevelId,
			action: formData.action,
			responsibleId: formData.responsibleId,
			notes: formData.notes,
			mocNumber: formData.mocNumber,
			deadline: formData.deadline,
			cost: formData.cost,
			expenseTypeId: formData.expenseTypeId,
		};
		saveDraftText(textData);
	}, 500);

	const debouncedSaveImages = debounce(() => {
		saveDraftImages(formData.photos);
	}, 1000);

	return {
		// Getters
		get currentStep() {
			return currentStep;
		},
		get formData() {
			return formData;
		},
		get validationErrors() {
			return validationErrors;
		},
		get isSubmitting() {
			return isSubmitting;
		},
		get isLinkModalOpen() {
			return isLinkModalOpen;
		},
		get isFirstStep() {
			return isFirstStep;
		},
		get isLastStep() {
			return isLastStep;
		},
		get currentStepId() {
			return currentStepId;
		},
		get progress() {
			return progress;
		},
		get draftRestored() {
			return draftRestored;
		},
		get draftLoading() {
			return draftLoading;
		},

		// Draft management
		async loadDraft(): Promise<boolean> {
			draftLoading = true;
			try {
				const textDraft = loadDraftText();
				const imageDraft = await loadDraftImages();

				if (!textDraft && imageDraft.length === 0) {
					draftLoading = false;
					return false;
				}

				// Restore text fields
				if (textDraft) {
					formData.riskType = textDraft.riskType;
					formData.linkedRiskId = textDraft.linkedRiskId;
					formData.machines = textDraft.machines;
					formData.lineId = textDraft.lineId;
					formData.categoryId = textDraft.categoryId;
					formData.dangerDescription = textDraft.dangerDescription;
					formData.riskLevelId = textDraft.riskLevelId;
					formData.action = textDraft.action;
					formData.responsibleId = textDraft.responsibleId;
					formData.notes = textDraft.notes;
					formData.mocNumber = textDraft.mocNumber;
					formData.deadline = textDraft.deadline;
					formData.cost = textDraft.cost;
					formData.expenseTypeId = textDraft.expenseTypeId;
				}

				// Restore images
				if (imageDraft.length > 0) {
					formData.photos = imageDraft;
					formData.photoUrls = imageDraft.map((f) => URL.createObjectURL(f));
				}

				draftRestored = true;
				draftLoading = false;
				return true;
			} catch (e) {
				storeLogger.warn("Failed to load draft:", e);
				draftLoading = false;
				return false;
			}
		},

		async clearDraft(): Promise<void> {
			await clearAllDrafts();
			draftRestored = false;
		},

		dismissDraftNotice() {
			draftRestored = false;
		},

		// Step navigation
		nextStep() {
			if (currentStep < WIZARD_STEPS.length - 1) {
				if (this.isStepValid(currentStep)) {
					currentStep++;
					return true;
				} else {
					// Show validation errors
					this.validateStep(currentStep);
					return false;
				}
			}
			return false;
		},

		previousStep() {
			if (currentStep > 0) {
				currentStep--;
				return true;
			}
			return false;
		},

		goToStep(step: number) {
			if (step >= 0 && step < WIZARD_STEPS.length) {
				// Validate all steps up to the target
				for (let i = 0; i < step; i++) {
					if (!this.isStepValid(i)) {
						// Run mutation version to show errors
						this.validateStep(i);
						currentStep = i;
						return false;
					}
				}
				currentStep = step;
				return true;
			}
			return false;
		},

		// Field updates
		updateField<K extends keyof RiskCreateData>(key: K, value: RiskCreateData[K]) {
			formData[key] = value;
			// Clear validation error when field is updated
			if (validationErrors[key]) {
				const newErrors = { ...validationErrors };
				delete newErrors[key];
				validationErrors = newErrors;
			}
			// Auto-save draft (skip photos, they're handled separately)
			if (key !== "photos" && key !== "photoUrls") {
				debouncedSaveText();
			}
		},

		// Photo management
		addPhoto(file: File) {
			formData.photos = [...formData.photos, file];
			formData.photoUrls = [...formData.photoUrls, URL.createObjectURL(file)];
			// Auto-save images to IndexedDB
			debouncedSaveImages();
		},

		removePhoto(index: number) {
			// Revoke the object URL to prevent memory leaks
			URL.revokeObjectURL(formData.photoUrls[index]);
			formData.photos = formData.photos.filter((_, i) => i !== index);
			formData.photoUrls = formData.photoUrls.filter((_, i) => i !== index);
			// Auto-save images to IndexedDB
			debouncedSaveImages();
		},

		// Linked risk management
		openLinkModal() {
			isLinkModalOpen = true;
		},

		closeLinkModal() {
			isLinkModalOpen = false;
		},

		setLinkedRisk(risk: LinkedRiskSummary | null) {
			formData.linkedRisk = risk;
			formData.linkedRiskId = risk?.id ?? null;
			isLinkModalOpen = false;
		},

		removeLinkedRisk() {
			formData.linkedRisk = null;
			formData.linkedRiskId = null;
		},

		// Check if a step is valid (without mutating state - safe for templates)
		isStepValid(step: number): boolean {
			switch (WIZARD_STEPS[step].id) {
				case "location":
					return !!formData.lineId && !!formData.machines.trim() && !!formData.categoryId;
				case "risk":
					return !!formData.dangerDescription.trim() && !!formData.riskLevelId;
				case "assignment":
					return true; // All optional
				case "optional":
					return formData.cost === null || formData.cost >= 0;
				default:
					return true;
			}
		},

		// Validation (mutates state - use only in event handlers)
		validateStep(step: number): boolean {
			const errors: Record<string, string> = {};

			switch (WIZARD_STEPS[step].id) {
				case "location":
					if (!formData.lineId) errors.lineId = "required";
					if (!formData.machines.trim()) errors.machines = "required";
					if (!formData.categoryId) errors.categoryId = "required";
					break;

				case "risk":
					if (!formData.dangerDescription.trim()) errors.dangerDescription = "required";
					if (!formData.riskLevelId) errors.riskLevelId = "required";
					// action is optional
					break;

				case "assignment":
					// Responsible and deadline are optional but recommended
					break;

				case "optional":
					// All fields are optional
					// Validate cost if provided
					if (formData.cost !== null && formData.cost < 0) {
						errors.cost = "invalid";
					}
					break;
			}

			validationErrors = errors;
			return Object.keys(errors).length === 0;
		},

		validateCurrentStep(): boolean {
			return this.validateStep(currentStep);
		},

		validateAll(): boolean {
			let allValid = true;
			const allErrors: Record<string, string> = {};

			for (let i = 0; i < WIZARD_STEPS.length; i++) {
				if (!this.isStepValid(i)) {
					allValid = false;
					// Now run the mutation version to collect errors
					this.validateStep(i);
					Object.assign(allErrors, validationErrors);
				}
			}

			validationErrors = allErrors;
			return allValid;
		},

		hasError(field: string): boolean {
			return field in validationErrors;
		},

		getError(field: string): string | undefined {
			return validationErrors[field];
		},

		// Submission state
		setSubmitting(value: boolean) {
			isSubmitting = value;
		},

		// Get data for API submission
		getSubmitData() {
			// Look up the responsible person's name from their ID (username)
			const responsiblePerson = formData.responsibleId
				? metadataStore.getResponsible(formData.responsibleId)
				: null;

			return {
				riskType: formData.riskType,
				linkedRiskId: formData.linkedRiskId,
				machine: formData.machines,
				line: formData.lineId,
				category: formData.categoryId,
				descriptionOfDanger: formData.dangerDescription,
				riskLevel: formData.riskLevelId,
				action: formData.action,
				responsible: responsiblePerson?.name || null,
				moc: formData.mocNumber || null,
				deadline: formData.deadline || null,
				cost: formData.cost,
				expenseType: formData.expenseTypeId || null,
			};
		},

		// Get photos for separate upload
		getPhotos(): File[] {
			return formData.photos;
		},

		// Reset form
		async reset() {
			// Clean up photo preview URLs
			formData.photoUrls.forEach((url) => URL.revokeObjectURL(url));

			// Clear saved drafts
			await clearAllDrafts();

			currentStep = 0;
			formData = getDefaultFormData();
			validationErrors = {};
			isSubmitting = false;
			isLinkModalOpen = false;
			draftRestored = false;
		},
	};
}

export const riskCreateStore = createRiskCreateStore();
