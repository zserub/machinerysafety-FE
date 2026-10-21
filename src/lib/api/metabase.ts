import { api } from "./client";

export interface MetabaseConfig {
	configured: boolean;
	embed_url?: string;
	metabase_url?: string;
}

export function getMetabaseConfig(): Promise<MetabaseConfig> {
	return api.get<MetabaseConfig>("/metabase/config");
}
