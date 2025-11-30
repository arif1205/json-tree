import { toast } from "sonner";

/**
 * Calculate breadcrumb path from node path
 * Converts "root.auto.driver_types.name" to "auto > driver_types > name"
 * Converts "root[0].key" to "[0] > key"
 * @param nodePath - The path to the node
 * @param jsonData - The JSON data
 * @returns The breadcrumb path
 */
export const calculateBreadcrumb = (
	nodePath: string | null,
	jsonData: unknown
): string => {
	if (!nodePath || !jsonData) {
		return "";
	}

	// Parse the path to extract segments with their types (object key or array index)
	// Path format: "root.key1.key2" or "root[0].key1" or "root.key1[0]"

	// Remove "root." prefix
	const pathWithoutRoot = nodePath.replace(/^root\.?/, "");

	if (!pathWithoutRoot) {
		return "";
	}

	// Match segments: Either [number] (Array) or word characters (Object)
	const segmentMatches = pathWithoutRoot.match(/(\[(\d+)\]|[^.[\]]+)/g);

	if (!segmentMatches || segmentMatches.length === 0) {
		return "";
	}

	const breadcrumbParts: string[] = [];

	for (const segment of segmentMatches) {
		if (segment.startsWith("[") && segment.endsWith("]")) {
			breadcrumbParts.push(segment);
		} else {
			breadcrumbParts.push(segment);
		}
	}

	return breadcrumbParts.join(" > ");
};

export const deleteNodeByPath = (path: string, data: unknown): unknown => {
	if (!data || path === "root") {
		return data;
	}

	// Parse the to be deleted path into segments
	const segments = path
		.replace(/^root\.?/, "") // Remove "root." prefix
		.split(/[.[\]]+/)
		.filter((seg) => seg !== "");

	// If no segments, return as it is
	if (segments.length === 0) {
		return data;
	}

	const cloned = JSON.parse(JSON.stringify(data));

	// Navigate to parent and delete the key
	let current: unknown = cloned;
	for (let i = 0; i < segments.length - 1; i++) {
		const segment = segments[i];
		// EXCEPTION: segment is an array index
		if (/^\d+$/.test(segment)) {
			if (Array.isArray(current)) {
				current = current[parseInt(segment, 10)];
			} else {
				return cloned;
			}
		} else {
			if (
				typeof current === "object" &&
				current !== null &&
				!Array.isArray(current)
			) {
				current = (current as Record<string, unknown>)[segment];
			} else {
				return cloned;
			}
		}
		if (!current) return cloned;
	}

	// Get the last segment (the key to delete)
	const lastSegment = segments[segments.length - 1];
	if (/^\d+$/.test(lastSegment)) {
		// EXCEPTION: Array index
		const index = parseInt(lastSegment, 10);
		if (Array.isArray(current)) {
			current.splice(index, 1);
		}
	} else {
		if (
			typeof current === "object" &&
			current !== null &&
			!Array.isArray(current)
		) {
			delete (current as Record<string, unknown>)[lastSegment];
		}
	}

	return cloned;
};

/**
 * Rename a node in JSON by its path
 * @param path - The path to the node to rename
 * @param newKey - The new key name
 * @param data - The JSON data
 * @returns The updated JSON data
 */
export const renameNodeByPath = (
	path: string,
	newKey: string,
	data: unknown
): unknown => {
	if (!data || path === "root") {
		return data;
	}

	// Parse the to be renamed path into segments
	const segments = path
		.replace(/^root\.?/, "") // Remove "root." prefix
		.split(/[.[\]]+/)
		.filter((seg) => seg !== "");

	if (segments.length === 0) {
		return data;
	}

	// Deep clone to avoid mutating the original data
	const cloned = JSON.parse(JSON.stringify(data));

	// Navigate to parent (the object containing the key to rename)
	let parent: unknown = cloned;
	for (let i = 0; i < segments.length - 1; i++) {
		const segment = segments[i];
		if (/^\d+$/.test(segment)) {
			if (Array.isArray(parent)) {
				parent = parent[parseInt(segment, 10)];
			} else {
				return cloned;
			}
		} else {
			if (
				typeof parent === "object" &&
				parent !== null &&
				!Array.isArray(parent)
			) {
				parent = (parent as Record<string, unknown>)[segment];
			} else {
				return cloned;
			}
		}
		if (!parent) return cloned;
	}

	// Get the last segment (the key to rename)
	const lastSegment = segments[segments.length - 1];
	if (/^\d+$/.test(lastSegment)) {
		// EXCEPTION: Can't rename array indices
		toast.error("Cannot rename array indices");
		return cloned;
	} else {
		// Object key - rename it while preserving order
		if (
			typeof parent === "object" &&
			parent !== null &&
			!Array.isArray(parent)
		) {
			const parentObj = parent as Record<string, unknown>;
			const value = parentObj[lastSegment];

			// Reconstruct object with keys in original order, replacing the renamed key
			const newObj: Record<string, unknown> = {};
			const keys = Object.keys(parentObj);

			for (const key of keys) {
				if (key === lastSegment) {
					newObj[newKey] = value;
				} else {
					newObj[key] = parentObj[key];
				}
			}

			// Replace the parent object in its container
			if (segments.length === 1) {
				return newObj;
			} else {
				let grandparent: unknown = cloned;
				for (let i = 0; i < segments.length - 2; i++) {
					const seg = segments[i];
					if (/^\d+$/.test(seg)) {
						if (Array.isArray(grandparent)) {
							grandparent = grandparent[parseInt(seg, 10)];
						}
					} else {
						if (
							typeof grandparent === "object" &&
							grandparent !== null &&
							!Array.isArray(grandparent)
						) {
							grandparent = (grandparent as Record<string, unknown>)[seg];
						}
					}
				}

				// Update grandparent with new object
				const parentKey = segments[segments.length - 2];
				if (/^\d+$/.test(parentKey)) {
					if (Array.isArray(grandparent)) {
						grandparent[parseInt(parentKey, 10)] = newObj;
					}
				} else {
					if (
						typeof grandparent === "object" &&
						grandparent !== null &&
						!Array.isArray(grandparent)
					) {
						(grandparent as Record<string, unknown>)[parentKey] = newObj;
					}
				}
			}
		}
	}

	return cloned;
};
