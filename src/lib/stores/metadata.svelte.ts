import type { RiskLevelOption, StatusOption, CategoryOption, ExpenseTypeOption, LineOption, ResponsibleOption } from "$lib/types/entry";
import * as m from "$lib/paraglide/messages";

// Translation maps for risk levels and statuses
const riskLevelTranslations: Record<string, () => string> = {
	urgent: () => m.riskLevel_urgent(),
	high: () => m.riskLevel_high(),
	medium: () => m.riskLevel_medium(),
	low: () => m.riskLevel_low(),
};

const statusTranslations: Record<string, () => string> = {
	open: () => m.status_open(),
	assigned: () => m.status_assigned(),
	"in-progress": () => m.status_inProgress(),
	"pending-verification": () => m.status_pendingVerification(),
	rejected: () => m.status_rejected(),
	closed: () => m.status_closed(),
};

const categoryTranslations: Record<string, () => string> = {
	mechanical: () => m.category_mechanical(),
	electrical: () => m.category_electrical(),
	safety: () => m.category_safety(),
	environmental: () => m.category_environmental(),
	process: () => m.category_process(),
	uncategorized: () => m.category_uncategorized(),
};

const expenseTypeTranslations: Record<string, () => string> = {
	capex: () => m.expense_capex(),
	opex: () => m.expense_opex(),
	maintenance: () => m.expense_maintenance(),
};

// Styling maps - colors/variants are determined entirely in frontend
const riskLevelStyles: Record<string, { color: string; badgeVariant: string }> = {
	urgent: { color: "text-danger", badgeVariant: "destructive" },
	high: { color: "text-warning", badgeVariant: "warning" },
	medium: { color: "text-info", badgeVariant: "info" },
	low: { color: "text-success", badgeVariant: "success" },
};

const statusStyles: Record<string, { color: string; badgeVariant: string }> = {
	open: { color: "text-info", badgeVariant: "info" },
	"in-progress": { color: "text-warning", badgeVariant: "warning" },
	completed: { color: "text-success", badgeVariant: "success" },
};

const categoryStyles: Record<string, string> = {
	mechanical: "text-warning",
	electrical: "text-danger",
	fall: "text-info",
	emergency: "text-danger",
	lockout: "text-warning",
};

// Fallback: capitalize first letter and replace dashes/underscores with spaces
function formatFallbackLabel(value: string): string {
	return value
		.replace(/[-_]/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

// Default fallback options (used before API responds or if API fails)
const defaultRiskLevels: RiskLevelOption[] = [
	{ value: "urgent", order: 1 },
	{ value: "high", order: 2 },
	{ value: "medium", order: 3 },
	{ value: "low", order: 4 },
];

const defaultStatuses: StatusOption[] = [
	{ value: "open", order: 1 },
	{ value: "assigned", order: 2 },
	{ value: "in-progress", order: 3 },
	{ value: "pending-verification", order: 4 },
	{ value: "rejected", order: 5 },
	{ value: "closed", order: 6 },
];

const defaultCategories: CategoryOption[] = [
	{ value: "mechanical", order: 1 },
	{ value: "electrical", order: 2 },
	{ value: "safety", order: 3 },
	{ value: "environmental", order: 4 },
	{ value: "process", order: 5 },
	{ value: "uncategorized", order: 6 },
];

const defaultExpenseTypes: ExpenseTypeOption[] = [
	{ value: "capex", order: 1 },
	{ value: "opex", order: 2 },
	{ value: "maintenance", order: 3 },
];

const defaultLines: LineOption[] = [
	{ value: "Production Line A", order: 1 },
	{ value: "Production Line B", order: 2 },
	{ value: "Production Line C", order: 3 },
	{ value: "Assembly Line 1", order: 4 },
	{ value: "Assembly Line 2", order: 5 },
	{ value: "Packaging Area", order: 6 },
	{ value: "Warehouse", order: 7 },
];

const defaultResponsibles: ResponsibleOption[] = [
	{ value: "john.smith", name: "John Smith", order: 1 },
	{ value: "maria.garcia", name: "Maria Garcia", order: 2 },
	{ value: "david.chen", name: "David Chen", order: 3 },
	{ value: "sarah.johnson", name: "Sarah Johnson", order: 4 },
	{ value: "michael.brown", name: "Michael Brown", order: 5 },
	{ value: "emma.wilson", name: "Emma Wilson", order: 6 },
	{ value: "james.taylor", name: "James Taylor", order: 7 },
	{ value: "lisa.anderson", name: "Lisa Anderson", order: 8 },
	{ value: "robert.martinez", name: "Robert Martinez", order: 9 },
	{ value: "jennifer.lee", name: "Jennifer Lee", order: 10 },
];

function createMetadataStore() {
	let riskLevels = $state<RiskLevelOption[]>(defaultRiskLevels);
	let statuses = $state<StatusOption[]>(defaultStatuses);
	let categories = $state<CategoryOption[]>(defaultCategories);
	let expenseTypes = $state<ExpenseTypeOption[]>(defaultExpenseTypes);
	let lines = $state<LineOption[]>(defaultLines);
	let responsibles = $state<ResponsibleOption[]>(defaultResponsibles);
	let loading = $state(false);
	let error = $state<string | null>(null);

	return {
		get riskLevels() {
			return riskLevels;
		},
		get statuses() {
			return statuses;
		},
		get categories() {
			return categories;
		},
		get expenseTypes() {
			return expenseTypes;
		},
		get lines() {
			return lines;
		},
		get responsibles() {
			return responsibles;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},

		// Get risk level option by value
		getRiskLevel(value: string): RiskLevelOption | undefined {
			return riskLevels.find((r) => r.value === value);
		},

		// Get status option by value
		getStatus(value: string): StatusOption | undefined {
			return statuses.find((s) => s.value === value);
		},

		// Get category option by value
		getCategory(value: string): CategoryOption | undefined {
			return categories.find((c) => c.value === value);
		},

		// Get expense type option by value
		getExpenseType(value: string): ExpenseTypeOption | undefined {
			return expenseTypes.find((e) => e.value === value);
		},

		// Get line option by value
		getLine(value: string): LineOption | undefined {
			return lines.find((l) => l.value === value);
		},

		// Get responsible option by value
		getResponsible(value: string): ResponsibleOption | undefined {
			return responsibles.find((r) => r.value === value || r.name === value);
		},

		// Get badge variant for a risk level (derived from styling map)
		getRiskLevelBadgeVariant(value: string): string {
			const normalized = value?.toLowerCase().replace(/_/g, "-") ?? "";
			return riskLevelStyles[normalized]?.badgeVariant ?? "default";
		},

		// Get badge variant for a status (derived from styling map)
		getStatusBadgeVariant(value: string): string {
			const normalized = value?.toLowerCase().replace(/_/g, "-") ?? "";
			return statusStyles[normalized]?.badgeVariant ?? "default";
		},

		// Get color for a risk level (derived from styling map)
		getRiskLevelColor(value: string): string {
			const normalized = value?.toLowerCase().replace(/_/g, "-") ?? "";
			return riskLevelStyles[normalized]?.color ?? "text-text";
		},

		// Get color for a status (derived from styling map)
		getStatusColor(value: string): string {
			const normalized = value?.toLowerCase().replace(/_/g, "-") ?? "";
			return statusStyles[normalized]?.color ?? "text-text";
		},

		// Get color for a category (derived from styling map)
		getCategoryColor(value: string): string {
			const normalized = value?.toLowerCase().replace(/_/g, "-") ?? "";
			return categoryStyles[normalized] ?? "text-text";
		},

		// Get translated label for a risk level (with fallback for unknown values)
		getRiskLevelLabel(value: string): string {
			if (!value) return "";
			const normalized = value.toLowerCase().replace(/_/g, "-");
			return riskLevelTranslations[normalized]?.() ?? this.getRiskLevel(normalized)?.label ?? formatFallbackLabel(value);
		},

		// Get translated label for a status (with fallback for unknown values)
		getStatusLabel(value: string): string {
			if (!value) return "";
			const normalized = value.toLowerCase().replace(/_/g, "-");
			return statusTranslations[normalized]?.() ?? this.getStatus(normalized)?.label ?? formatFallbackLabel(value);
		},

		// Get translated label for a category (with fallback for unknown values)
		getCategoryLabel(value: string): string {
			if (!value) return "";
			const normalized = value.toLowerCase().replace(/_/g, "-");
			return categoryTranslations[normalized]?.() ?? formatFallbackLabel(value);
		},

		// Get translated label for an expense type (with fallback for unknown values)
		getExpenseTypeLabel(value: string): string {
			if (!value) return "";
			const normalized = value.toLowerCase().replace(/_/g, "-");
			return expenseTypeTranslations[normalized]?.() ?? formatFallbackLabel(value);
		},

		// Set risk levels (called after API fetch) - normalize to lowercase
		setRiskLevels(levels: RiskLevelOption[]) {
			riskLevels = levels
				.map((l) => ({ ...l, value: l.value.toLowerCase() }))
				.sort((a, b) => a.order - b.order);
		},

		// Set statuses (called after API fetch) - normalize to lowercase with hyphens
		setStatuses(statusList: StatusOption[]) {
			statuses = statusList
				.map((s) => ({ ...s, value: s.value.toLowerCase().replace(/_/g, "-") }))
				.sort((a, b) => a.order - b.order);
		},

		// Set categories (called after API fetch) - normalize to lowercase
		setCategories(categoryList: CategoryOption[]) {
			categories = categoryList
				.map((c) => ({ ...c, value: c.value.toLowerCase() }))
				.sort((a, b) => a.order - b.order);
		},

		// Set expense types (called after API fetch) - normalize to lowercase
		setExpenseTypes(expenseTypeList: ExpenseTypeOption[]) {
			expenseTypes = expenseTypeList
				.map((e) => ({ ...e, value: e.value.toLowerCase() }))
				.sort((a, b) => a.order - b.order);
		},

		// Set lines (called after API fetch)
		setLines(lineList: LineOption[]) {
			lines = lineList.sort((a, b) => a.order - b.order);
		},

		// Set responsibles (called after API fetch)
		setResponsibles(responsibleList: ResponsibleOption[]) {
			responsibles = responsibleList.sort((a, b) => a.order - b.order);
		},

		// Set loading state
		setLoading(isLoading: boolean) {
			loading = isLoading;
		},

		// Set error state
		setError(err: string | null) {
			error = err;
		},

		// Reset to defaults
		resetToDefaults() {
			riskLevels = defaultRiskLevels;
			statuses = defaultStatuses;
			categories = defaultCategories;
			expenseTypes = defaultExpenseTypes;
			lines = defaultLines;
			responsibles = defaultResponsibles;
			error = null;
		},
	};
}

export const metadataStore = createMetadataStore();
