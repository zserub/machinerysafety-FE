import type { Entry, EntryHistoryItem } from "$lib/types/entry";

// Sample data arrays for generating mock entries
export const mockMachines = [
	"CNC Machine #1",
	"CNC Machine #2",
	"CNC Machine #3",
	"Hydraulic Press #1",
	"Hydraulic Press #2",
	"Hydraulic Press #3",
	"Conveyor Belt #1",
	"Conveyor Belt #2",
	"Welding Station #1",
	"Welding Station #2",
	"Welding Station #3",
	"Assembly Robot #1",
	"Assembly Robot #2",
	"Packaging Unit #1",
	"Packaging Unit #2",
	"Laser Cutter #1",
	"Drill Press #1",
	"Drill Press #2",
	"Forklift #1",
	"Forklift #2",
];

export const mockLines = [
	"Production Line A",
	"Production Line B",
	"Production Line C",
	"Assembly Line 1",
	"Assembly Line 2",
	"Packaging Area",
	"Warehouse",
];

export const mockDangers = [
	"Missing protective guard on rotating spindle",
	"Safety training needed for new operators",
	"Annual inspection overdue",
	"Faulty emergency stop button",
	"Documentation needs update",
	"Worn safety interlock detected",
	"Loose electrical connection",
	"Hydraulic fluid leak",
	"Excessive noise levels",
	"Poor lighting conditions",
	"Slippery floor surface",
	"Inadequate ventilation",
	"Sharp edges on metal parts",
	"Heavy lifting hazard",
	"Chemical storage issue",
	"Fire extinguisher expired",
	"First aid kit needs restocking",
	"Safety signage faded",
	"Guardrail damaged",
	"PPE storage inadequate",
];

export const mockActions = [
	"Install protective guard",
	"Complete safety training",
	"Schedule inspection",
	"Replace emergency stop",
	"Update documentation",
	"Replace safety interlock",
	"Repair electrical connection",
	"Fix hydraulic leak",
	"Install noise barriers",
	"Improve lighting",
	"Apply anti-slip coating",
	"Install ventilation",
	"Deburr metal edges",
	"Provide lifting equipment",
	"Reorganize chemical storage",
	"Replace fire extinguisher",
	"Restock first aid kit",
	"Replace safety signage",
	"Repair guardrail",
	"Install PPE storage",
];

export const mockRiskLevels = ["urgent", "high", "medium", "low"];
export const mockStatuses = ["open", "in-progress", "completed"];
export const mockCategories = ["mechanical", "electrical", "fall", "emergency", "lockout"];
export const mockExpenseTypes = ["capex", "opex", "maintenance"];

export const mockResponsibles = [
	"John Smith",
	"Maria Garcia",
	"David Chen",
	"Sarah Johnson",
	"Michael Brown",
	"Emma Wilson",
	"James Taylor",
	"Lisa Anderson",
	"Robert Martinez",
	"Jennifer Lee",
];

function randomElement<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start: Date, end: Date): string {
	const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	return date.toISOString().split("T")[0];
}

/**
 * Creates a single mock entry with optional overrides.
 */
export function createMockEntry(overrides: Partial<Entry> = {}): Entry {
	const today = new Date();
	const createdAt = randomDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000), today);
	const updatedAt = randomDate(new Date(createdAt), today);
	const deadline = randomDate(new Date(createdAt), new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000));
	const status = randomElement(mockStatuses);
	const isCompleted = status === "completed";

	const baseEntry: Entry = {
		id: String(Math.floor(Math.random() * 10000)).padStart(4, "0"),
		machine: randomElement(mockMachines),
		line: randomElement(mockLines),
		descriptionOfDanger: randomElement(mockDangers),
		riskLevel: randomElement(mockRiskLevels),
		action: randomElement(mockActions),
		deadline,
		status,
		responsible: randomElement(mockResponsibles),
		moc: Math.random() > 0.5 ? `MOC-2026-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}` : "",
		createdAt,
		updatedAt,
		cost: Math.floor(Math.random() * 10000),
		category: randomElement(mockCategories),
		additionalNotes: Math.random() > 0.5 ? "Additional notes for this entry." : "",
		expenseType: randomElement(mockExpenseTypes),
		createdBy: randomElement(mockResponsibles),
		originalDeadline: deadline,
		postponements: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
		photos: [],
		history: [
			{
				id: `hist-${Date.now()}-1`,
				timestamp: createdAt,
				user: randomElement(mockResponsibles),
				action: "created",
			},
		],
		riskType: 2,
		linkedRiskId: null,
		linkedRisk: null,
		implementationDate: isCompleted ? randomDate(new Date(createdAt), today) : null,
	};

	return { ...baseEntry, ...overrides };
}

/**
 * Generates an array of mock entries.
 */
export function generateMockEntries(count: number): Entry[] {
	const entries: Entry[] = [];
	for (let i = 1; i <= count; i++) {
		entries.push(
			createMockEntry({
				id: String(i).padStart(4, "0"),
			})
		);
	}
	return entries;
}

// Pre-built fixtures for common test scenarios
export const mockUrgentEntry = createMockEntry({
	id: "TEST-001",
	riskLevel: "urgent",
	status: "open",
});

export const mockCompletedEntry = createMockEntry({
	id: "TEST-002",
	status: "completed",
	implementationDate: new Date().toISOString().split("T")[0],
});

export const mockInProgressEntry = createMockEntry({
	id: "TEST-003",
	status: "in-progress",
});
