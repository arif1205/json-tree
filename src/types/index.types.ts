export interface TreeNode {
	id: string;
	key: string;
	value: unknown;
	children: TreeNode[] | null;
	path: string;
	type: "object" | "array" | "primitive";
}
