import { useState } from "react";
import { useJsonTree } from "@/hooks/json/useJsonTree.hook";
import { useAppDispatch } from "@/hooks/store/useStore.hooks";
import { useGlobalState } from "@/hooks/store/useGlobalStore.hooks";
import {
	setJsonData,
	setSelectedNodeId,
} from "@/store/slice/global/globalSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
	ChevronRight,
	ChevronDown,
	Minus,
	Pencil,
	Check,
	X,
} from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import type { TreeNode } from "@/types/index.types";
import { toast } from "sonner";
import DeleteConfirmModal from "../modal/delete/DeleteConfirm.modal";

interface TreeNodeItemProps {
	node: TreeNode;
	level?: number;
	isLast?: boolean;
	parentIsLast?: boolean[];
}

const TreeNodeItem = ({
	node,
	level = 0,
	isLast = false,
	parentIsLast = [],
}: TreeNodeItemProps) => {
	const dispatch = useAppDispatch();
	const { jsonData, selectedNodeId } = useGlobalState();
	const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);
	const [renameValue, setRenameValue] = useState(node.key);
	const hasChildren = node.children && node.children.length > 0;
	const isExpandable = hasChildren;
	const isSelected = selectedNodeId === node.id;

	/**
	 * Delete a node from JSON by its path
	 * Path format: "root.key1.key2" or "root[0].key1"
	 */
	const deleteNodeByPath = (path: string, data: unknown): unknown => {
		if (!data || path === "root") {
			// Can't delete root, return as is
			return data;
		}

		// Parse the path into segments
		const segments = path
			.replace(/^root\.?/, "") // Remove "root." prefix
			.split(/[.[\]]+/)
			.filter((seg) => seg !== "");

		if (segments.length === 0) {
			return data;
		}

		// Deep clone to avoid mutating original
		const cloned = JSON.parse(JSON.stringify(data));

		// Navigate to parent and delete the key
		let current: unknown = cloned;
		for (let i = 0; i < segments.length - 1; i++) {
			const segment = segments[i];
			// Check if segment is an array index
			if (/^\d+$/.test(segment)) {
				if (Array.isArray(current)) {
					current = current[parseInt(segment, 10)];
				} else {
					return cloned; // Invalid path
				}
			} else {
				if (
					typeof current === "object" &&
					current !== null &&
					!Array.isArray(current)
				) {
					current = (current as Record<string, unknown>)[segment];
				} else {
					return cloned; // Invalid path
				}
			}
			if (!current) return cloned; // Path doesn't exist
		}

		// Get the last segment (the key to delete)
		const lastSegment = segments[segments.length - 1];
		if (/^\d+$/.test(lastSegment)) {
			// Array index
			const index = parseInt(lastSegment, 10);
			if (Array.isArray(current)) {
				current.splice(index, 1);
			}
		} else {
			// Object key
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

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsDeleteModalOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (!jsonData) {
			toast.error("No JSON data to delete from");
			return;
		}

		try {
			// Parse current JSON (handle both string and object)
			let currentJson: unknown;
			if (typeof jsonData === "string") {
				currentJson = JSON.parse(jsonData);
			} else {
				currentJson = jsonData;
			}

			// Delete the node
			const updatedJson = deleteNodeByPath(node.path, currentJson);

			// Update the store (always store as string)
			dispatch(setJsonData(JSON.parse(JSON.stringify(updatedJson))));

			toast.success(`Deleted "${node.key}"`);
		} catch (error) {
			console.error("Error deleting node:", error);
			toast.error("Failed to delete node");
		}
	};

	/**
	 * Rename a node in JSON by its path
	 * Path format: "root.key1.key2" or "root[0].key1"
	 */
	const renameNodeByPath = (
		path: string,
		newKey: string,
		data: unknown
	): unknown => {
		if (!data || path === "root") {
			// Can't rename root, return as is
			return data;
		}

		// Parse the path into segments
		const segments = path
			.replace(/^root\.?/, "") // Remove "root." prefix
			.split(/[.[\]]+/)
			.filter((seg) => seg !== "");

		if (segments.length === 0) {
			return data;
		}

		// Deep clone to avoid mutating original
		const cloned = JSON.parse(JSON.stringify(data));

		// Navigate to parent (the object containing the key to rename)
		let parent: unknown = cloned;
		for (let i = 0; i < segments.length - 1; i++) {
			const segment = segments[i];
			if (/^\d+$/.test(segment)) {
				if (Array.isArray(parent)) {
					parent = parent[parseInt(segment, 10)];
				} else {
					return cloned; // Invalid path
				}
			} else {
				if (
					typeof parent === "object" &&
					parent !== null &&
					!Array.isArray(parent)
				) {
					parent = (parent as Record<string, unknown>)[segment];
				} else {
					return cloned; // Invalid path
				}
			}
			if (!parent) return cloned; // Path doesn't exist
		}

		// Get the last segment (the key to rename)
		const lastSegment = segments[segments.length - 1];
		if (/^\d+$/.test(lastSegment)) {
			// Can't rename array indices
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
						// Replace with new key name in the same position
						newObj[newKey] = value;
					} else {
						// Keep other keys as is
						newObj[key] = parentObj[key];
					}
				}

				// Replace the parent object in its container
				if (segments.length === 1) {
					// Root level key - replace at root
					return newObj;
				} else {
					// Navigate to grandparent and update
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

	const handleRenameClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsRenaming(true);
		setRenameValue(node.key);
	};

	const handleRenameConfirm = () => {
		if (!renameValue.trim()) {
			toast.error("Key name cannot be empty");
			setRenameValue(node.key);
			setIsRenaming(false);
			return;
		}

		if (renameValue === node.key) {
			// No change
			setIsRenaming(false);
			return;
		}

		if (!jsonData) {
			toast.error("No JSON data to rename");
			setIsRenaming(false);
			return;
		}

		try {
			// Parse current JSON (handle both string and object)
			let currentJson: unknown;
			if (typeof jsonData === "string") {
				currentJson = JSON.parse(jsonData);
			} else {
				currentJson = jsonData;
			}

			// Rename the node
			const updatedJson = renameNodeByPath(
				node.path,
				renameValue.trim(),
				currentJson
			);

			// Update the store (always store as string)
			dispatch(setJsonData(JSON.parse(JSON.stringify(updatedJson))));

			toast.success(`Renamed "${node.key}" to "${renameValue.trim()}"`);
			setIsRenaming(false);
		} catch (error) {
			console.error("Error renaming node:", error);
			toast.error("Failed to rename node");
			setIsRenaming(false);
			setRenameValue(node.key);
		}
	};

	const handleRenameCancel = () => {
		setIsRenaming(false);
		setRenameValue(node.key);
	};

	const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleRenameConfirm();
		} else if (e.key === "Escape") {
			handleRenameCancel();
		}
	};

	const handleNodeClick = (e: React.MouseEvent) => {
		// Don't select if clicking on action buttons or input
		const target = e.target as HTMLElement;
		if (
			target.closest("button") ||
			target.closest("input") ||
			target.closest("svg")
		) {
			return;
		}

		e.stopPropagation();

		// Handle expand/collapse if node has children
		if (isExpandable) {
			setIsExpanded(!isExpanded);
		}

		// Toggle selection
		if (isSelected) {
			dispatch(setSelectedNodeId(null));
		} else {
			dispatch(setSelectedNodeId(node.id));
		}
	};

	// Don't render root node, only its children
	if (node.key === "root" && node.children) {
		return (
			<div>
				{node.children.map((child, index, array) => (
					<TreeNodeItem
						key={child.id}
						node={child}
						level={0}
						isLast={index === array.length - 1}
						parentIsLast={[]}
					/>
				))}
			</div>
		);
	}

	return (
		<div className='select-none relative'>
			{/* Tree lines - positioned absolutely */}
			{level > 0 && (
				<div
					className='absolute left-0 top-0 bottom-0 pointer-events-none'
					style={{ width: `${(level + 1) * 20}px` }}>
					{/* Vertical lines for each parent level that is not last */}
					{parentIsLast.map((isParentLast, idx) => {
						if (isParentLast) return null;
						return (
							<div
								key={idx}
								className='absolute top-0 bottom-0'
								style={{
									left: `${idx * 20 + 10}px`,
									width: "1px",
									backgroundColor: "hsl(var(--border))",
								}}
							/>
						);
					})}
					{/* Horizontal line connecting to this node */}
					<div
						className='absolute'
						style={{
							left: `${parentIsLast.length * 20}px`,
							top: "50%",
							width: "10px",
							height: "1px",
							backgroundColor: "hsl(var(--border))",
							transform: "translateY(-50%)",
						}}
					/>
					{/* Vertical line continuation from horizontal (if not last child) */}
					{!isLast && (
						<div
							className='absolute'
							style={{
								left: `${parentIsLast.length * 20 + 10}px`,
								top: "50%",
								bottom: 0,
								width: "1px",
								backgroundColor: "hsl(var(--border))",
							}}
						/>
					)}
				</div>
			)}

			{/* Node content */}
			<div
				className={cn(
					"flex items-center gap-2 py-1 px-2 rounded cursor-pointer group relative z-10 transition-colors",
					isSelected
						? "bg-primary/20 hover:bg-primary/30 border border-primary/50"
						: "hover:bg-accent/50"
				)}
				style={{ paddingLeft: `${level * 20 + 8}px` }}
				onClick={handleNodeClick}>
				{/* Expand/Collapse Chevron */}
				{hasChildren ? (
					isExpanded ? (
						<ChevronDown className='size-4 text-foreground shrink-0' />
					) : (
						<ChevronRight className='size-4 text-foreground shrink-0' />
					)
				) : (
					<div className='size-4 shrink-0' />
				)}

				{/* Key Name or Rename Input */}
				{isRenaming ? (
					<div className='flex items-center gap-1 flex-1'>
						<Input
							value={renameValue}
							onChange={(e) => setRenameValue(e.target.value)}
							onKeyDown={handleRenameKeyDown}
							onBlur={handleRenameConfirm}
							autoFocus
							className='h-7 text-sm'
							onClick={(e) => e.stopPropagation()}
						/>
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleRenameConfirm();
							}}
							className='shrink-0 flex items-center justify-center size-6 rounded bg-green-500 hover:bg-green-600 text-white cursor-pointer'
							aria-label='Confirm rename'>
							<Check className='size-3' />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleRenameCancel();
							}}
							className='shrink-0 flex items-center justify-center size-6 rounded bg-gray-500 hover:bg-gray-600 text-white cursor-pointer'
							aria-label='Cancel rename'>
							<X className='size-3' />
						</button>
					</div>
				) : (
					<span className='text-sm font-medium text-foreground flex-1 truncate'>
						{node.key}
					</span>
				)}

				{/* Action Buttons */}
				{!isRenaming && (
					<div className='flex items-center gap-1 shrink-0'>
						{/* Rename Button */}
						<button
							onClick={handleRenameClick}
							className='shrink-0 flex items-center justify-center size-5 rounded-full bg-blue-300 hover:bg-blue-500 text-white cursor-pointer'
							aria-label='Rename node'>
							<Pencil className='size-3' />
						</button>
						{/* Delete Button */}
						<button
							onClick={handleDeleteClick}
							className='shrink-0 flex items-center justify-center size-5 rounded-full bg-red-300 hover:bg-red-500 text-white cursor-pointer'
							aria-label='Delete node'>
							<Minus className='size-3' strokeWidth={3} />
						</button>
					</div>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleDeleteConfirm}
				title='Delete Node'
				itemName={node.key}
				description={`Are you sure you want to delete "${node.key}"? This will remove the node and all its children. This action cannot be undone.`}
			/>

			{/* Children */}
			{isExpanded && hasChildren && (
				<div className='relative'>
					{node.children?.map((child, index, array) => (
						<TreeNodeItem
							key={child.id}
							node={child}
							level={level + 1}
							isLast={index === array.length - 1}
							parentIsLast={[...parentIsLast, isLast]}
						/>
					))}
				</div>
			)}
		</div>
	);
};

const TreeView = () => {
	const { treeData, hasData } = useJsonTree();

	return (
		<Card className='h-full'>
			<CardHeader>
				<CardTitle>Tree</CardTitle>
			</CardHeader>
			<CardContent className='h-full overflow-auto'>
				{hasData && treeData ? (
					<div className='py-2'>
						<TreeNodeItem node={treeData} level={0} />
					</div>
				) : (
					<div className='flex items-center justify-center h-full text-muted-foreground'>
						No JSON data loaded
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default TreeView;
