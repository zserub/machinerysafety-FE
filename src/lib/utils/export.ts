import type { Entry, ColumnConfig } from "$lib/types/entry";

/**
 * Escapes special characters for CSV format
 */
function escapeCSV(value: unknown): string {
	if (value === null || value === undefined) return "";
	// Skip complex types like arrays
	if (Array.isArray(value)) return "";
	const str = String(value);
	// If contains comma, newline, or quote, wrap in quotes and escape existing quotes
	if (str.includes(",") || str.includes("\n") || str.includes('"')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

/**
 * Exports entries to CSV format (Excel compatible)
 */
export function exportToCSV(entries: Entry[], columns: ColumnConfig[]): void {
	// Get visible columns
	const visibleColumns = columns.filter((col) => col.visible);

	// Create header row
	const headers = visibleColumns.map((col) => escapeCSV(col.label));
	const headerRow = headers.join(",");

	// Create data rows
	const dataRows = entries.map((entry) => {
		return visibleColumns
			.map((col) => {
				const value = entry[col.key];
				if (col.key === "cost" && typeof value === "number") {
					return escapeCSV(value.toFixed(2));
				}
				return escapeCSV(value);
			})
			.join(",");
	});

	// Combine all rows
	const csvContent = [headerRow, ...dataRows].join("\n");

	// Add BOM for Excel to recognize UTF-8
	const BOM = "\uFEFF";
	const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

	// Create download link
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `safety-entries-${new Date().toISOString().split("T")[0]}.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Escapes special characters for XML
 */
function escapeXML(value: unknown): string {
	if (value === null || value === undefined) return "";
	// Skip complex types like arrays
	if (Array.isArray(value)) return "";
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

/**
 * Exports entries to Excel XML format (.xls)
 * This format is natively supported by Excel without requiring external libraries
 */
export function exportToExcel(entries: Entry[], columns: ColumnConfig[]): void {
	const visibleColumns = columns.filter((col) => col.visible);

	// Build XML spreadsheet
	let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E0E0E0" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Date">
      <NumberFormat ss:Format="yyyy-mm-dd"/>
    </Style>
    <Style ss:ID="Currency">
      <NumberFormat ss:Format="#,##0.00"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Safety Entries">
    <Table>
`;

	// Column widths
	visibleColumns.forEach((col) => {
		let width = 100;
		if (col.key === "id") width = 50;
		if (col.key === "descriptionOfDanger") width = 200;
		if (col.key === "action") width = 150;
		xml += `      <Column ss:Width="${width}"/>\n`;
	});

	// Header row
	xml += "      <Row>\n";
	visibleColumns.forEach((col) => {
		xml += `        <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXML(col.label)}</Data></Cell>\n`;
	});
	xml += "      </Row>\n";

	// Data rows
	entries.forEach((entry) => {
		xml += "      <Row>\n";
		visibleColumns.forEach((col) => {
			const value = entry[col.key];
			let type = "String";
			let styleId = "";
			let displayValue = escapeXML(value);

			if (col.key === "cost" && typeof value === "number") {
				type = "Number";
				styleId = ' ss:StyleID="Currency"';
				displayValue = String(value);
			} else if (
				(col.key === "deadline" || col.key === "createdAt" || col.key === "updatedAt") &&
				value
			) {
				type = "DateTime";
				styleId = ' ss:StyleID="Date"';
				// Format as ISO date for Excel
				const date = new Date(value as string);
				displayValue = date.toISOString();
			}

			xml += `        <Cell${styleId}><Data ss:Type="${type}">${displayValue}</Data></Cell>\n`;
		});
		xml += "      </Row>\n";
	});

	xml += `    </Table>
  </Worksheet>
</Workbook>`;

	// Create download
	const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `safety-entries-${new Date().toISOString().split("T")[0]}.xls`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
