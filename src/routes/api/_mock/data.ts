/**
 * Mock data for development mode API routes.
 * This file is only used when running `bun run dev`.
 */

// Type definition for mock entries (matches backend PascalCase format)
export interface MockEntry {
	ID: number;
	RiskType: number;
	LinkedRiskID: number | null;
	CreationDate: string;
	Machines: string;
	LineID: number;
	CategoryID: number;
	DangerDescription: string;
	RiskLevelID: number;
	Action: string;
	ResponsibleID: number | null;
	MOCNumber: number | null;
	Deadline: string;
	ActionStateID: number;
	ImplementationDate: string | null;
	EntryModifiedAt: string;
	CreatedByID: number;
	CommittedAt: string | null;
	Cost: number | null;
	ExpenseTypeID: number | null;
	LineName: string;
	CategoryName: string;
	RiskLevelName: string;
	StateName: string;
	ResponsibleName: string;
	CreatedByName: string;
	ExpenseTypeName: string;
	LinkedRisk: null;
	Photos: never[];
	StatusHistory: never[];
	DeadlineHistory: never[];
}

// Mock user for authentication
export const mockUser = {
	person_id: 1,
	person_name: "Dev User",
	person_email: "dev@example.com",
	username: "devuser",
	role_name: "admin",
};

// All permissions for dev mode
export const mockPermissions = [
	"dashboard:view",
	"entries:view",
	"entries:create",
	"entries:edit",
	"entries:delete",
	"statistics:view",
	"supervisor_dashboard:view",
	"settings:view",
	"settings:edit",
];

// Mock metadata (styling is handled by frontend, not stored in DB)
export const mockMetadata = {
	riskLevels: [
		{ value: "urgent", order: 1 },
		{ value: "high", order: 2 },
		{ value: "medium", order: 3 },
		{ value: "low", order: 4 },
	],
	statuses: [
		{ value: "open", order: 1 },
		{ value: "in-progress", order: 2 },
		{ value: "completed", order: 3 },
	],
	categories: [
		{ value: "mechanical", order: 1 },
		{ value: "electrical", order: 2 },
		{ value: "fall", order: 3 },
		{ value: "emergency", order: 4 },
		{ value: "lockout", order: 5 },
	],
	expenseTypes: [
		{ value: "capex", order: 1 },
		{ value: "opex", order: 2 },
		{ value: "maintenance", order: 3 },
	],
	lines: [
		{ value: "Production Line A", order: 1 },
		{ value: "Production Line B", order: 2 },
		{ value: "Production Line C", order: 3 },
		{ value: "Assembly Line 1", order: 4 },
		{ value: "Assembly Line 2", order: 5 },
	],
	responsibles: [
		{ value: "john.smith", name: "John Smith", order: 1 },
		{ value: "jane.doe", name: "Jane Doe", order: 2 },
		{ value: "bob.johnson", name: "Bob Johnson", order: 3 },
		{ value: "alice.williams", name: "Alice Williams", order: 4 },
		{ value: "charlie.brown", name: "Charlie Brown", order: 5 },
	],
};

// Mock entries (in backend PascalCase format)
export const mockEntries: MockEntry[] = [
	{
		ID: 1,
		RiskType: 1,
		LinkedRiskID: null,
		CreationDate: "2024-01-15T10:30:00Z",
		Machines: "CNC Machine #3",
		LineID: 1,
		CategoryID: 1,
		DangerDescription: "Exposed rotating parts without proper guarding",
		RiskLevelID: 1,
		Action: "Install protective guard around rotating components",
		ResponsibleID: 1,
		MOCNumber: 2024001,
		Deadline: "2024-02-15",
		ActionStateID: 1,
		ImplementationDate: null,
		EntryModifiedAt: "2024-01-20T14:45:00Z",
		CreatedByID: 1,
		CommittedAt: null,
		Cost: 2500,
		ExpenseTypeID: 1,
		LineName: "Production Line A",
		CategoryName: "mechanical",
		RiskLevelName: "urgent",
		StateName: "open",
		ResponsibleName: "devuser",
		CreatedByName: "Dev User",
		ExpenseTypeName: "capex",
		LinkedRisk: null,
		Photos: [],
		StatusHistory: [],
		DeadlineHistory: [],
	},
	{
		ID: 2,
		RiskType: 2,
		LinkedRiskID: null,
		CreationDate: "2024-01-18T09:00:00Z",
		Machines: "Assembly Robot A1",
		LineID: 2,
		CategoryID: 4,
		DangerDescription: "Missing emergency stop button in operator area",
		RiskLevelID: 2,
		Action: "Install additional e-stop within operator reach",
		ResponsibleID: 2,
		MOCNumber: 2024002,
		Deadline: "2024-02-28",
		ActionStateID: 2,
		ImplementationDate: null,
		EntryModifiedAt: "2024-01-25T11:20:00Z",
		CreatedByID: 1,
		CommittedAt: null,
		Cost: 800,
		ExpenseTypeID: 2,
		LineName: "Production Line B",
		CategoryName: "emergency",
		RiskLevelName: "high",
		StateName: "in-progress",
		ResponsibleName: "Jane Doe",
		CreatedByName: "Dev User",
		ExpenseTypeName: "opex",
		LinkedRisk: null,
		Photos: [],
		StatusHistory: [],
		DeadlineHistory: [],
	},
	{
		ID: 3,
		RiskType: 2,
		LinkedRiskID: null,
		CreationDate: "2024-01-20T15:00:00Z",
		Machines: "Conveyor Belt System",
		LineID: 1,
		CategoryID: 5,
		DangerDescription: "Electrical panel accessible without lockout procedure",
		RiskLevelID: 3,
		Action: "Implement LOTO procedure and install lockout points",
		ResponsibleID: 3,
		MOCNumber: null,
		Deadline: "2024-03-15",
		ActionStateID: 1,
		ImplementationDate: null,
		EntryModifiedAt: "2024-01-20T15:00:00Z",
		CreatedByID: 1,
		CommittedAt: null,
		Cost: 1200,
		ExpenseTypeID: 3,
		LineName: "Production Line A",
		CategoryName: "lockout",
		RiskLevelName: "medium",
		StateName: "open",
		ResponsibleName: "devuser",
		CreatedByName: "Dev User",
		ExpenseTypeName: "maintenance",
		LinkedRisk: null,
		Photos: [],
		StatusHistory: [],
		DeadlineHistory: [],
	},
	{
		ID: 4,
		RiskType: 2,
		LinkedRiskID: null,
		CreationDate: "2024-01-10T08:30:00Z",
		Machines: "Packaging Unit #7",
		LineID: 3,
		CategoryID: 3,
		DangerDescription: "Elevated platform without fall protection railings",
		RiskLevelID: 2,
		Action: "Install safety railings and toe boards",
		ResponsibleID: 1,
		MOCNumber: 2024003,
		Deadline: "2024-02-20",
		ActionStateID: 3,
		ImplementationDate: "2024-02-01",
		EntryModifiedAt: "2024-02-01T16:00:00Z",
		CreatedByID: 1,
		CommittedAt: null,
		Cost: 3500,
		ExpenseTypeID: 1,
		LineName: "Production Line C",
		CategoryName: "fall",
		RiskLevelName: "high",
		StateName: "completed",
		ResponsibleName: "John Smith",
		CreatedByName: "Dev User",
		ExpenseTypeName: "capex",
		LinkedRisk: null,
		Photos: [],
		StatusHistory: [],
		DeadlineHistory: [],
	},
	{
		ID: 5,
		RiskType: 2,
		LinkedRiskID: null,
		CreationDate: "2024-01-22T11:00:00Z",
		Machines: "Welding Station B",
		LineID: 2,
		CategoryID: 1,
		DangerDescription: "Inadequate ventilation causing fume exposure",
		RiskLevelID: 4,
		Action: "Upgrade local exhaust ventilation system",
		ResponsibleID: 2,
		MOCNumber: null,
		Deadline: "2024-04-01",
		ActionStateID: 1,
		ImplementationDate: null,
		EntryModifiedAt: "2024-01-22T11:00:00Z",
		CreatedByID: 1,
		CommittedAt: null,
		Cost: 5000,
		ExpenseTypeID: 1,
		LineName: "Production Line B",
		CategoryName: "mechanical",
		RiskLevelName: "low",
		StateName: "open",
		ResponsibleName: "Jane Doe",
		CreatedByName: "Dev User",
		ExpenseTypeName: "capex",
		LinkedRisk: null,
		Photos: [],
		StatusHistory: [],
		DeadlineHistory: [],
	},
];

// In-memory state for dev mode
let isLoggedIn = false;
let entries = [...mockEntries];
let nextEntryId = 6;

export function getLoginState() {
	return isLoggedIn;
}

export function setLoginState(state: boolean) {
	isLoggedIn = state;
}

export function getEntries() {
	return entries;
}

export function getEntryById(id: number) {
	return entries.find((e) => e.ID === id);
}

export function addEntry(entry: MockEntry): MockEntry {
	entry.ID = nextEntryId++;
	entries.push(entry);
	return entry;
}

export function updateEntry(id: number, updates: Partial<MockEntry>): MockEntry | null {
	const index = entries.findIndex((e) => e.ID === id);
	if (index !== -1) {
		entries[index] = { ...entries[index], ...updates };
		return entries[index];
	}
	return null;
}

export function deleteEntry(id: number) {
	const index = entries.findIndex((e) => e.ID === id);
	if (index !== -1) {
		entries.splice(index, 1);
		return true;
	}
	return false;
}
