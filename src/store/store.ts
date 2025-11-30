import { configureStore } from "@reduxjs/toolkit";
import globalReducer, {
	globalSliceMiddleware,
} from "./slice/global/globalSlice";

export const store = configureStore({
	reducer: {
		global: globalReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(globalSliceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
