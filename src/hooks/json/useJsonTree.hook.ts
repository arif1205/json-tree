import { useGlobalState } from "@/hooks/store/useGlobalStore.hooks";
import type { TreeNode } from "@/types/index.types";

/**
 * Custom hook to transform JSON data into a tree structure
 * Each node has a unique ID based on its path for future operations (delete/update)
 */
export const useJsonTree = () => {
	const { jsonData } = useGlobalState();

	if (!jsonData) {
		return {
			treeData: null,
			hasData: false,
		};
	}

	/**
	 * Recursively transforms a JSON value into a TreeNode
	 * @param value - The value to transform
	 * @param key - The key name for this node
	 * @param path - The full path to this node (for unique ID generation)
	 * @returns TreeNode
	 */
	const transformToTree = (
		value: unknown,
		key: string,
		path: string
	): TreeNode => {
		// Build the current path - handle array indices differently
		const isArrayIndex = key.startsWith("[") && key.endsWith("]");
		const currentPath = path
			? isArrayIndex
				? `${path}${key}` // For arrays: root[0], root[0].key[1]
				: `${path}.${key}` // For objects: root.key, root.key.nested
			: key; // Root level

		// Handle null or undefined
		if (value === null || value === undefined) {
			return {
				id: currentPath,
				key,
				value: value,
				children: null,
				path: currentPath,
				type: "primitive",
			};
		}

		// Handle arrays
		if (Array.isArray(value)) {
			return {
				id: currentPath,
				key,
				value: null,
				children: value.map((item, index) =>
					transformToTree(item, `[${index}]`, currentPath)
				),
				path: currentPath,
				type: "array",
			};
		}

		// Handle objects
		if (typeof value === "object") {
			const entries = Object.entries(value);
			return {
				id: currentPath,
				key,
				value: null,
				children:
					entries.length > 0
						? entries.map(([childKey, childValue]) =>
								transformToTree(childValue, childKey, currentPath)
						  )
						: null,
				path: currentPath,
				type: "object",
			};
		}

		// Handle primitives (string, number, boolean)
		return {
			id: currentPath,
			key,
			value: value,
			children: null,
			path: currentPath,
			type: "primitive",
		};
	};

	// Handle root level - if it's an object, transform each key
	// If it's an array, transform it directly
	// If it's a primitive, wrap it
	let treeData: TreeNode;

	if (typeof jsonData === "object" && jsonData !== null) {
		if (Array.isArray(jsonData)) {
			// Root is an array
			treeData = {
				id: "root",
				key: "root",
				value: null,
				children: jsonData.map((item, index) =>
					transformToTree(item, `[${index}]`, "root")
				),
				path: "root",
				type: "array",
			};
		} else {
			// Root is an object
			const entries = Object.entries(jsonData);
			treeData = {
				id: "root",
				key: "root",
				value: null,
				children:
					entries.length > 0
						? entries.map(([key, value]) => transformToTree(value, key, "root"))
						: null,
				path: "root",
				type: "object",
			};
		}
	} else {
		// Root is a primitive
		treeData = {
			id: "root",
			key: "root",
			value: jsonData,
			children: null,
			path: "root",
			type: "primitive",
		};
	}

	return {
		treeData,
		hasData: true,
	};
};
