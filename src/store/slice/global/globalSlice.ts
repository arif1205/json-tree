import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

const globalSlice = createSlice({
	name: "global",
	initialState,
	reducers: {
		setGlobalState: (state, action) => {
			state = action.payload;
		},
	},
});

export const { setGlobalState } = globalSlice.actions;
export default globalSlice.reducer;
