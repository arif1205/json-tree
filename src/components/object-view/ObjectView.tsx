import { useGlobalState } from "@/hooks/store/useGlobalStore.hooks";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

/**
 * Format JSON data as object-like syntax (unquoted keys)
 */
const formatAsObject = (data: unknown, indent = 0): string => {
	const indentStr = "  ".repeat(indent);

	if (data === null) {
		return "null";
	}

	if (data === undefined) {
		return "undefined";
	}

	if (typeof data === "string") {
		return `"${data}"`;
	}

	if (typeof data === "number" || typeof data === "boolean") {
		return String(data);
	}

	if (Array.isArray(data)) {
		if (data.length === 0) {
			return "[]";
		}
		const items = data
			.map((item) => `${indentStr}  ${formatAsObject(item, indent + 1)}`)
			.join(",\n");
		return `[\n${items}\n${indentStr}]`;
	}

	if (typeof data === "object") {
		const entries = Object.entries(data);
		if (entries.length === 0) {
			return "{}";
		}
		const items = entries
			.map(([key, value]) => {
				const formattedValue = formatAsObject(value, indent + 1);
				return `${indentStr}  ${key}: ${formattedValue}`;
			})
			.join(",\n");
		return `{\n${items}\n${indentStr}}`;
	}

	return String(data);
};

const ObjectView = () => {
	const { jsonData, breadcrumb } = useGlobalState();

	// Parse JSON if it's a string, otherwise use as is
	let parsedData: unknown = jsonData;
	if (jsonData && typeof jsonData === "string") {
		try {
			parsedData = JSON.parse(jsonData);
		} catch {
			parsedData = jsonData;
		}
	}

	return (
		<Card className='h-full'>
			<CardHeader>
				<CardTitle>Object View</CardTitle>
			</CardHeader>
			<CardContent className='h-full overflow-auto'>
				{breadcrumb && (
					<div className='mb-4 p-3 rounded-md bg-muted border border-border'>
						<span className='text-sm font-medium text-muted-foreground'>
							Path:{" "}
						</span>
						<span className='text-sm font-semibold text-foreground'>
							{breadcrumb}
						</span>
					</div>
				)}
				{parsedData ? (
					<pre className='bg-muted p-4 rounded-md text-sm font-mono'>
						{formatAsObject(parsedData)}
					</pre>
				) : (
					<div className='flex items-center justify-center h-full text-muted-foreground'>
						No JSON data loaded
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default ObjectView;
