import { api } from "./client";

interface ColumnVisibilitySettings {
	columns: Record<string, boolean>;
}

interface UserSettings {
	columnVisibility: Record<string, boolean>;
	language: string;
	theme: "dark" | "light";
}

export const settingsApi = {
	async getColumnVisibility(): Promise<ColumnVisibilitySettings> {
		return api.get<ColumnVisibilitySettings>("/settings/columns");
	},

	async saveColumnVisibility(columns: Record<string, boolean>): Promise<void> {
		return api.put("/settings/columns", { columns });
	},

	async getUserSettings(): Promise<UserSettings> {
		return api.get<UserSettings>("/settings");
	},

	async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
		return api.patch<UserSettings>("/settings", settings);
	},
};
