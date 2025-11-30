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
		<Card className='overflow-hidden gap-2'>
			<CardHeader className='px-4! border-b border-border pb-3!'>
				<CardTitle>Object View</CardTitle>
			</CardHeader>
			<CardContent className='max-h-[calc(100vh-120px)] h-[600px] overflow-auto'>
				{parsedData !== null && (
					<div className='mb-4'>
						<span className='text-sm font-semibold text-muted-foreground'>
							Selected Node:{" "}
						</span>
						<span className='text-sm font-medium text-foreground'>
							{breadcrumb || "No node selected"}
						</span>
					</div>
				)}

				{parsedData ? (
					<pre className='bg-muted p-4 rounded-md text-sm font-mono max-h-[calc(100vh-120px)] h-[350px] overflow-auto'>
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
