// Dynamic types - values come from backend
export type RiskLevel = string;
export type EntryStatus = string;
export type Category = string;
export type ExpenseType = string;
export type RiskType = 1 | 2; // 1 = short-term, 2 = long-term

// Metadata for dynamic options (styling is derived in frontend, not from API)
export interface RiskLevelOption {
	value: string;
	label?: string;
	order: number;
}

export interface StatusOption {
	value: string;
	label?: string;
	order: number;
}

export interface CategoryOption {
	value: string;
	order: number;
}

export interface ExpenseTypeOption {
	value: string;
	order: number;
}

export interface LineOption {
	value: string;
	order: number;
}

export interface ResponsibleOption {
	value: string;
	name: string; // Display name
	order: number;
}

// Photo attached to an entry
export interface EntryPhoto {
	id: string;
	url: string;
	filename: string;
	uploadedAt: string;
}

// History/activity item for an entry
export interface EntryHistoryItem {
	id: string;
	timestamp: string;
	user: string;
	action: string; // "created", "assigned", "postponed", "resolved", "rejected", etc.
	details?: string;
	reason?: string;
}

// Comment on an entry
export interface EntryComment {
	id: string;
	riskId: string;
	authorId: string;
	authorName: string;
	content: string;
	createdAt: string;
}

// Summary of a linked risk (for display purposes)
export interface LinkedRiskSummary {
	id: string;
	machine: string;
	line: string;
	descriptionOfDanger: string;
	riskType: RiskType;
}

export interface Entry {
	id: string;
	machine: string;
	line: string;
	descriptionOfDanger: string;
	riskLevel: RiskLevel;
	action: string;
	deadline: string;
	status: EntryStatus;
	responsible: string;
	moc: string;
	createdAt: string;
	updatedAt: string;
	cost: number;
	category: Category;
	additionalNotes: string;
	expenseType: ExpenseType;
	createdBy: string;
	originalDeadline: string;
	postponements: number;
	photos: EntryPhoto[];
	history: EntryHistoryItem[];
	// Risk type and linking fields
	riskType: RiskType;
	linkedRiskId: string | null;
	linkedRisk: LinkedRiskSummary | null;
	implementationDate: string | null;
}

export interface ColumnConfig {
	key: keyof Entry;
	label: string;
	visible: boolean;
	defaultVisible: boolean;
}

export const defaultColumns: ColumnConfig[] = [
	{ key: "id", label: "ID", visible: true, defaultVisible: true },
	{ key: "machine", label: "Machine", visible: true, defaultVisible: true },
	{ key: "line", label: "Line", visible: true, defaultVisible: true },
	{ key: "descriptionOfDanger", label: "Description of Danger", visible: true, defaultVisible: true },
	{ key: "riskLevel", label: "Risk Level", visible: true, defaultVisible: true },
	{ key: "riskType", label: "Risk Type", visible: false, defaultVisible: false },
	{ key: "action", label: "Action", visible: true, defaultVisible: true },
	{ key: "deadline", label: "Deadline", visible: true, defaultVisible: true },
	{ key: "implementationDate", label: "Implementation Date", visible: false, defaultVisible: false },
	{ key: "status", label: "Status", visible: true, defaultVisible: true },
	{ key: "responsible", label: "Responsible", visible: true, defaultVisible: true },
	{ key: "moc", label: "MOC", visible: false, defaultVisible: false },
	{ key: "createdAt", label: "Created", visible: false, defaultVisible: false },
	{ key: "updatedAt", label: "Updated", visible: false, defaultVisible: false },
	{ key: "cost", label: "Cost", visible: false, defaultVisible: false },
	{ key: "expenseType", label: "Expense Type", visible: false, defaultVisible: false },
];
