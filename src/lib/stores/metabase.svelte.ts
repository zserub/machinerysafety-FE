import { getMetabaseConfig } from "$lib/api/metabase";

let _embedUrl = $state("");
let _metabaseUrl = $state("");
let _configured = $state(false);
let _loading = $state(false);
let _loaded = $state(false);

export const metabaseStore = {
	get embedUrl() {
		return _embedUrl;
	},
	get fullUrl() {
		return _metabaseUrl;
	},
	get isConfigured() {
		return _configured;
	},
	get loading() {
		return _loading;
	},
	async load() {
		if (_loaded || _loading) return;
		_loading = true;
		try {
			const config = await getMetabaseConfig();
			_configured = config.configured;
			_embedUrl = config.embed_url ?? "";
			_metabaseUrl = config.metabase_url ?? "";
			_loaded = true;
		} catch {
			_configured = false;
			_loaded = true;
		} finally {
			_loading = false;
		}
	}
};
