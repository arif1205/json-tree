import type { RootState } from "@/store/store";
import { useAppSelector } from "./useStore.hooks";

export function useGlobalState() {
	return useAppSelector((state: RootState) => state.global);
}
