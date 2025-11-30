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
	undo: null,
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
		setUndo: (state, action: PayloadAction<unknown | null>) => {
			state.undo = action.payload;
		},
		undo: (state) => {
			if (state.undo !== null) {
				state.jsonData = state.undo;
				state.undo = null;
			}
		},
	},
});

export const {
	importJson,
	setJsonData,
	clearJsonData,
	setSelectedNodeId,
	setBreadcrumb,
	setUndo,
	undo,
} = globalSlice.actions;
export default globalSlice.reducer;

export const globalSliceMiddleware: Middleware =
	(store) => (next) => (action) => {
		/**
		 * Save current jsonData to undo BEFORE any action that modifies jsonData
		 */
		const stateBeforeAction = store.getState() as { global: GlobalState };
		const willModifyJson =
			importJson.match(action) ||
			setJsonData.match(action) ||
			clearJsonData.match(action);

		if (willModifyJson && stateBeforeAction.global.jsonData !== null) {
			// Deep clone the current jsonData to undo
			const currentJsonData = stateBeforeAction.global.jsonData;
			const clonedJsonData = JSON.parse(JSON.stringify(currentJsonData));
			// Update undo in state before proceeding
			store.dispatch(setUndo(clonedJsonData));
		}

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
		 * Handle undo action - save to localStorage
		 */
		if (undo.match(action)) {
			const state = store.getState() as { global: GlobalState };

			try {
				if (state.global.jsonData !== null) {
					localStorageUtils.set(JSON_STORAGE_KEY, state.global.jsonData);
				} else {
					localStorageUtils.remove(JSON_STORAGE_KEY);
				}
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
