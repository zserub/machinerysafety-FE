import type { RiskLevel, EntryStatus } from "$lib/types/entry";

export interface DateRange {
	from: string | null;
	to: string | null;
}

export interface Filters {
	riskLevels: RiskLevel[];
	statuses: EntryStatus[];
	lines: string[];
	responsibles: string[];
	deadlineRange: DateRange;
	createdRange: DateRange;
	updatedRange: DateRange;
}

const defaultFilters: Filters = {
	riskLevels: [],
	statuses: [],
	lines: [],
	responsibles: [],
	deadlineRange: { from: null, to: null },
	createdRange: { from: null, to: null },
	updatedRange: { from: null, to: null },
};

function createFiltersStore() {
	let filters = $state<Filters>(structuredClone(defaultFilters));

	return {
		get filters() {
			return filters;
		},
		get hasActiveFilters() {
			return (
				filters.riskLevels.length > 0 ||
				filters.statuses.length > 0 ||
				filters.lines.length > 0 ||
				filters.responsibles.length > 0 ||
				filters.deadlineRange.from !== null ||
				filters.deadlineRange.to !== null ||
				filters.createdRange.from !== null ||
				filters.createdRange.to !== null ||
				filters.updatedRange.from !== null ||
				filters.updatedRange.to !== null
			);
		},
		get activeFilterCount() {
			let count = 0;
			if (filters.riskLevels.length > 0) count++;
			if (filters.statuses.length > 0) count++;
			if (filters.lines.length > 0) count++;
			if (filters.responsibles.length > 0) count++;
			if (filters.deadlineRange.from || filters.deadlineRange.to) count++;
			if (filters.createdRange.from || filters.createdRange.to) count++;
			if (filters.updatedRange.from || filters.updatedRange.to) count++;
			return count;
		},
		toggleRiskLevel(level: RiskLevel) {
			const index = filters.riskLevels.indexOf(level);
			if (index === -1) {
				filters.riskLevels = [...filters.riskLevels, level];
			} else {
				filters.riskLevels = filters.riskLevels.filter((l) => l !== level);
			}
		},
		toggleStatus(status: EntryStatus) {
			const index = filters.statuses.indexOf(status);
			if (index === -1) {
				filters.statuses = [...filters.statuses, status];
			} else {
				filters.statuses = filters.statuses.filter((s) => s !== status);
			}
		},
		toggleLine(line: string) {
			const index = filters.lines.indexOf(line);
			if (index === -1) {
				filters.lines = [...filters.lines, line];
			} else {
				filters.lines = filters.lines.filter((l) => l !== line);
			}
		},
		toggleResponsible(responsible: string) {
			const index = filters.responsibles.indexOf(responsible);
			if (index === -1) {
				filters.responsibles = [...filters.responsibles, responsible];
			} else {
				filters.responsibles = filters.responsibles.filter((r) => r !== responsible);
			}
		},
		setDeadlineRange(from: string | null, to: string | null) {
			filters.deadlineRange = { from, to };
		},
		setCreatedRange(from: string | null, to: string | null) {
			filters.createdRange = { from, to };
		},
		setUpdatedRange(from: string | null, to: string | null) {
			filters.updatedRange = { from, to };
		},
		clearAll() {
			filters = structuredClone(defaultFilters);
		},
		clearRiskLevels() {
			filters.riskLevels = [];
		},
		clearStatuses() {
			filters.statuses = [];
		},
		clearLines() {
			filters.lines = [];
		},
		clearResponsibles() {
			filters.responsibles = [];
		},
		clearDeadlineRange() {
			filters.deadlineRange = { from: null, to: null };
		},
		clearCreatedRange() {
			filters.createdRange = { from: null, to: null };
		},
		clearUpdatedRange() {
			filters.updatedRange = { from: null, to: null };
		},
	};
}

export const filtersStore = createFiltersStore();
