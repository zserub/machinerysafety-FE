import { api } from "$lib/api/client";

interface VersionResponse {
	version: string;
}

function createVersionStore() {
	const frontendVersion = import.meta.env.VITE_VERSION ?? "dev";
	let backendVersion = $state<string>("...");

	async function fetchBackendVersion() {
		try {
			const response = await api.get<VersionResponse>("/version");
			backendVersion = response.version;
		} catch {
			backendVersion = "N/A";
		}
	}

	return {
		get frontend() {
			return frontendVersion;
		},
		get backend() {
			return backendVersion;
		},
		fetchBackendVersion,
	};
}

export const versionStore = createVersionStore();
