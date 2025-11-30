export const localStorageUtils = {
	get: <T = unknown>(key: string): T | null => {
		try {
			const item = localStorage.getItem(key);
			if (!item) return null;
			return JSON.parse(item) as T;
		} catch (error) {
			console.error("Error reading from localStorage:", error);
			return null;
		}
	},

	set: <T = unknown>(key: string, value: T): void => {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error("Error writing to localStorage:", error);
		}
	},

	remove: (key: string): void => {
		try {
			localStorage.removeItem(key);
		} catch (error) {
			console.error("Error removing from localStorage:", error);
		}
	},
};
