export interface GlobalState {
	jsonData: unknown | null;
	undo: unknown | null;
	selectedNodeId: string | null;
	breadcrumb: string;
}
