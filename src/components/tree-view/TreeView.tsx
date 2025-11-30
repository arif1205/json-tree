import { useJsonTree } from "@/hooks/json/useJsonTree.hook";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TreeNodeItem from "./TreeNodeItem";

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
