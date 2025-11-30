/**
 * Calculate breadcrumb path from node path
 * Converts "root.auto.driver_types.name" to "auto > driver_types > name"
 * Converts "root[0].key" to "[0] > key"
 */
export const calculateBreadcrumb = (
	nodePath: string | null,
	jsonData: unknown
): string => {
	if (!nodePath || !jsonData) {
		return "";
	}

	// Parse the path to extract segments with their types (key or array index)
	// Path format: "root.key1.key2" or "root[0].key1" or "root.key1[0]"
	const pathWithoutRoot = nodePath.replace(/^root\.?/, ""); // Remove "root." prefix

	if (!pathWithoutRoot) {
		return "";
	}

	// Match segments: either [number] for arrays or word characters for object keys
	const segmentMatches = pathWithoutRoot.match(/(\[(\d+)\]|[^.[\]]+)/g);

	if (!segmentMatches || segmentMatches.length === 0) {
		return "";
	}

	// Build breadcrumb parts
	const breadcrumbParts: string[] = [];

	for (const segment of segmentMatches) {
		// Check if it's an array index (format: [0])
		if (segment.startsWith("[") && segment.endsWith("]")) {
			breadcrumbParts.push(segment); // Keep as [0]
		} else {
			// It's an object key
			breadcrumbParts.push(segment);
		}
	}

	return breadcrumbParts.join(" > ");
};
