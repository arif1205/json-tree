import {
	createSlice,
	type Middleware,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type { GlobalState } from "@/types/store.types";
import { localStorageUtils } from "@/lib/localstorage";
import { JSON_STORAGE_KEY } from "@/data/index.data";

const savedData = localStorageUtils.get<string>(JSON_STORAGE_KEY);
const initialState: GlobalState = {
	jsonData: savedData || null,
};

const globalSlice = createSlice({
	name: "global",
	initialState,
	reducers: {
		setJsonData: (state, action: PayloadAction<string>) => {
			console.log(action.payload);

			state.jsonData = action.payload;
		},
		clearJsonData: (state) => {
			state.jsonData = null;
		},
	},
});

export const { setJsonData, clearJsonData } = globalSlice.actions;
export default globalSlice.reducer;

export const globalSliceMiddleware: Middleware =
	(store) => (next) => (action) => {
		const result = next(action);
		/**
		 * Update the localStorage when the related actions are dispatched
		 */

		if (clearJsonData.match(action)) {
			try {
				localStorageUtils.remove(JSON_STORAGE_KEY);
			} catch (error) {
				console.error("Failed to remove JSON data from localStorage:", error);
			}
		}

		/**
		 * Save the current tab to localStorage when the related actions are dispatched
		 */
		if (setJsonData.match(action)) {
			const state = store.getState() as { global: GlobalState };

			try {
				localStorageUtils.set(JSON_STORAGE_KEY, state.global.jsonData);
			} catch (error) {
				console.error("Failed to save JSON data to localStorage:", error);
			}
		}

		return result;
	};
