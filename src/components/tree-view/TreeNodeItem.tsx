import { useGlobalState } from "@/hooks/store/useGlobalStore.hooks";
import { useAppDispatch } from "@/hooks/store/useStore.hooks";
import { cn } from "@/lib/utils";
import {
	setJsonData,
	setSelectedNodeId,
} from "@/store/slice/global/globalSlice";
import type { TreeNode } from "@/types/index.types";
import { Check, ChevronDown, ChevronRight, Minus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DeleteConfirmModal from "../modal/delete/DeleteConfirm.modal";
import { Input } from "../ui/input";
import { deleteNodeByPath, renameNodeByPath } from "@/lib/json.lib";
import { Button } from "../ui/button";

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

	const handleDeleteConfirm = () => {
		if (!jsonData) {
			toast.error("No JSON data to delete from");
			return;
		}

		try {
			let currentJson: unknown;
			if (typeof jsonData === "string") {
				currentJson = JSON.parse(jsonData);
			} else {
				currentJson = jsonData;
			}

			const updatedJson = deleteNodeByPath(node.path, currentJson);
			dispatch(setJsonData(JSON.parse(JSON.stringify(updatedJson))));

			toast.success(`Deleted "${node.key}"`);
		} catch {
			toast.error("Failed to delete node");
		}
	};

	const handleRenameConfirm = () => {
		if (!renameValue.trim()) {
			toast.error("Key name cannot be empty");
			setRenameValue(node.key);
			setIsRenaming(false);
			return;
		}

		if (renameValue === node.key) {
			setIsRenaming(false);
			return;
		}

		if (!jsonData) {
			toast.error("No JSON data to rename");
			setIsRenaming(false);
			return;
		}

		try {
			let currentJson: unknown;
			if (typeof jsonData === "string") {
				currentJson = JSON.parse(jsonData);
			} else {
				currentJson = jsonData;
			}

			const updatedJson = renameNodeByPath(
				node.path,
				renameValue.trim(),
				currentJson
			);

			dispatch(setJsonData(JSON.parse(JSON.stringify(updatedJson))));
			toast.success(`Renamed "${node.key}" to "${renameValue.trim()}"`);
			setIsRenaming(false);
		} catch {
			toast.error("Failed to rename node");
			setIsRenaming(false);
			setRenameValue(node.key);
		}
	};

	const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleRenameConfirm();
		} else if (e.key === "Escape") {
			setIsRenaming(false);
			setRenameValue(node.key);
		}
	};

	const handleNodeClick = (e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		if (
			target.closest("button") ||
			target.closest("input") ||
			target.closest(".chevron-container")
		) {
			return;
		}

		e.stopPropagation();

		if (isSelected) {
			dispatch(setSelectedNodeId(null));
		} else {
			dispatch(setSelectedNodeId(node.id));
		}
	};

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
			{level > 0 && (
				<div
					className='absolute left-0 top-0 bottom-0 pointer-events-none'
					style={{ width: `${(level + 1) * 20}px` }}>
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

			<div
				className={cn(
					"flex items-center gap-2 py-1 px-2 rounded cursor-pointer group relative z-10 transition-colors",
					isSelected
						? "bg-primary/20 hover:bg-primary/30 border border-primary/50"
						: "hover:bg-accent/50"
				)}
				style={{ paddingLeft: `${level * 20 + 8}px` }}
				onClick={handleNodeClick}>
				{hasChildren ? (
					<div
						className='chevron-container shrink-0 cursor-pointer'
						onClick={(e) => {
							e.stopPropagation();
							if (isExpandable) {
								setIsExpanded(!isExpanded);
							}
						}}>
						{isExpanded ? (
							<ChevronDown className='size-4 text-foreground' />
						) : (
							<ChevronRight className='size-4 text-foreground' />
						)}
					</div>
				) : (
					<div className='size-4 shrink-0' />
				)}

				{isRenaming ? (
					<div className='flex items-center gap-1 flex-1'>
						<Input
							value={renameValue}
							onChange={(e) => setRenameValue(e.target.value)}
							onKeyDown={handleRenameKeyDown}
							onBlur={handleRenameConfirm}
							autoFocus
							className='h-7 text-sm border-none outline-none shadow-xs!'
							onClick={(e) => e.stopPropagation()}
						/>
						<Button
							variant='ghost'
							size='icon'
							onClick={(e) => {
								e.stopPropagation();
								handleRenameConfirm();
							}}
							className='shrink-0 flex items-center justify-center size-4 rounded-full bg-green-500 hover:bg-green-600 text-white cursor-pointer'
							aria-label='Confirm rename'>
							<Check className='size-3' />
						</Button>
						<Button
							variant='ghost'
							size='icon'
							onClick={(e) => {
								e.stopPropagation();
								setIsRenaming(false);
								setRenameValue(node.key);
							}}
							className='shrink-0 flex items-center justify-center size-4 rounded-full bg-gray-500 hover:bg-gray-600 text-white cursor-pointer'
							aria-label='Cancel rename'>
							<X className='size-3' />
						</Button>
					</div>
				) : (
					<span
						className='text-sm font-medium text-foreground flex-1 truncate py-1'
						onDoubleClick={(e) => {
							e.stopPropagation();
							setIsRenaming(true);
							setRenameValue(node.key);
						}}>
						{node.key}
					</span>
				)}

				{!isRenaming && (
					<div className='flex items-center gap-1 shrink-0'>
						<Button
							variant='ghost'
							size='icon'
							onClick={(e) => {
								e.stopPropagation();
								setIsDeleteModalOpen(true);
							}}
							className='shrink-0 flex items-center justify-center size-4 rounded-full bg-red-300 hover:bg-red-500 text-white cursor-pointer'
							aria-label='Delete node'>
							<Minus className='size-3' strokeWidth={3} />
						</Button>
					</div>
				)}
			</div>

			<DeleteConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleDeleteConfirm}
				title='Delete Node'
				itemName={node.key}
				description={`Are you sure you want to delete "${node.key}"? This will remove the node and all its children. This action cannot be undone.`}
			/>

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

export default TreeNodeItem;
