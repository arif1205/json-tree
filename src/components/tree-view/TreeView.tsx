import { useJsonTree } from "@/hooks/json/useJsonTree.hook";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TreeNodeItem from "./TreeNodeItem";

const TreeView = () => {
	const { treeData, hasData } = useJsonTree();

	return (
		<Card className='max-h-[calc(100vh-120px)] h-[500px] overflow-hidden gap-2'>
			<CardHeader className='px-4! border-b border-border pb-3!'>
				<CardTitle>Tree View</CardTitle>
			</CardHeader>
			<CardContent className='overflow-auto'>
				{hasData && treeData ? (
					<div className='py-2'>
						<TreeNodeItem node={treeData} level={0} />
					</div>
				) : (
					<div className='flex items-center justify-center h-[500px] max-h-full text-muted-foreground'>
						No JSON data loaded
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default TreeView;
