export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

function createToastStore() {
	let toasts = $state<Toast[]>([]);

	function generateId(): string {
		return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
	}

	function add(type: ToastType, message: string, duration = 3000) {
		const id = generateId();
		const toast: Toast = { id, type, message, duration };
		toasts = [...toasts, toast];

		if (duration > 0) {
			setTimeout(() => {
				remove(id);
			}, duration);
		}

		return id;
	}

	function remove(id: string) {
		toasts = toasts.filter((t) => t.id !== id);
	}

	return {
		get toasts() {
			return toasts;
		},

		success(message: string, duration?: number) {
			return add("success", message, duration);
		},

		error(message: string, duration?: number) {
			return add("error", message, duration);
		},

		info(message: string, duration?: number) {
			return add("info", message, duration);
		},

		warning(message: string, duration?: number) {
			return add("warning", message, duration);
		},

		remove,

		clear() {
			toasts = [];
		},
	};
}

export const toastStore = createToastStore();
