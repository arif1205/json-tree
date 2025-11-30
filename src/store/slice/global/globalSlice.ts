import {
	createSlice,
	type Middleware,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type { GlobalState } from "@/types/store.types";
import { localStorageUtils } from "@/lib/localstorage";
import { JSON_STORAGE_KEY } from "@/data/index.data";
import { calculateBreadcrumb } from "@/lib/json.lib";

const savedData = localStorageUtils.get<string>(JSON_STORAGE_KEY);
const initialState: GlobalState = {
	jsonData: savedData || null,
	selectedNodeId: null,
	breadcrumb: "",
};

const globalSlice = createSlice({
	name: "global",
	initialState,
	reducers: {
		importJson: (state, action: PayloadAction<string>) => {
			state.jsonData = action.payload;
		},
		setJsonData: (state, action: PayloadAction<string>) => {
			state.jsonData = action.payload;
		},
		clearJsonData: (state) => {
			state.jsonData = null;
		},
		setSelectedNodeId: (state, action: PayloadAction<string | null>) => {
			state.selectedNodeId = action.payload;
		},
		setBreadcrumb: (state, action: PayloadAction<string>) => {
			state.breadcrumb = action.payload;
		},
	},
});

export const {
	importJson,
	setJsonData,
	clearJsonData,
	setSelectedNodeId,
	setBreadcrumb,
} = globalSlice.actions;
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

		/**
		 * While import new json data, reset everything else
		 */
		if (importJson.match(action)) {
			const state = store.getState() as { global: GlobalState };

			try {
				localStorageUtils.set(JSON_STORAGE_KEY, state.global.jsonData);
				store.dispatch(setSelectedNodeId(null));
				store.dispatch(setBreadcrumb(""));
			} catch (error) {
				console.error("Failed to save JSON data to localStorage:", error);
			}
		}

		/**
		 * Update breadcrumb when selectedNodeId changes
		 */
		if (setSelectedNodeId.match(action)) {
			const state = store.getState() as { global: GlobalState };
			const selectedNodeId = action.payload;

			if (selectedNodeId) {
				const breadcrumb = calculateBreadcrumb(
					selectedNodeId,
					state.global.jsonData
				);
				// Update breadcrumb in state
				store.dispatch(setBreadcrumb(breadcrumb));
			} else {
				// Clear breadcrumb if no node is selected
				store.dispatch(setBreadcrumb(""));
			}
		}

		return result;
	};
