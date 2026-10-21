import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getEntries, addEntry, mockMetadata, type MockEntry } from "../_mock/data";

export const GET: RequestHandler = async ({ url }) => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	const entries = getEntries();
	const page = parseInt(url.searchParams.get("page") || "1");
	const pageSize = parseInt(url.searchParams.get("pageSize") || "100");

	return json({
		entries,
		total: entries.length,
		page,
		pageSize,
	});
};

export const POST: RequestHandler = async ({ request }) => {
	// Only respond in dev mode
	if (!import.meta.env.DEV) {
		return new Response(null, { status: 404 });
	}

	const body = await request.json();
	const now = new Date().toISOString();

	const newEntry: MockEntry = {
		ID: 0, // Will be set by addEntry
		RiskType: body.riskType || 2,
		LinkedRiskID: body.linkedRiskId || null,
		CreationDate: now,
		Machines: body.machines || "",
		LineID: 1,
		CategoryID: 1,
		DangerDescription: body.dangerDescription || "",
		RiskLevelID: 1,
		Action: body.action || "",
		ResponsibleID: body.responsibleId ? parseInt(body.responsibleId) : null,
		MOCNumber: body.mocNumber ? parseInt(body.mocNumber) : null,
		Deadline: body.deadline || now.split("T")[0],
		ActionStateID: 1,
		ImplementationDate: null,
		EntryModifiedAt: now,
		CreatedByID: 1,
		CommittedAt: null,
		Cost: body.cost || 0,
		ExpenseTypeID: body.expenseTypeId ? parseInt(body.expenseTypeId) : 1,
		LineName: body.lineId || "Production Line A",
		CategoryName: body.categoryId || "mechanical",
		RiskLevelName: body.riskLevelId || "medium",
		StateName: "open",
		ResponsibleName: mockMetadata.responsibles.find((r) => r.value === body.responsibleId)?.name || "Unassigned",
		CreatedByName: "Dev User",
		ExpenseTypeName: body.expenseTypeId || "capex",
		LinkedRisk: null,
		Photos: [],
		StatusHistory: [],
		DeadlineHistory: [],
	};

	const created = addEntry(newEntry);
	return json(created, { status: 201 });
};
