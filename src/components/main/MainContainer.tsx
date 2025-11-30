import { useGlobalState } from "@/hooks/store/useGlobalStore.hooks";
import { useAppDispatch } from "@/hooks/store/useStore.hooks";
import { setJsonData } from "@/store/slice/global/globalSlice";
import { useState } from "react";
import { toast } from "sonner";
import ImportJsonModal from "../modal/import/ImportJson.modal";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TreeView from "../tree-view/TreeView";

const MainContainer = () => {
	const dispatch = useAppDispatch();
	const { jsonData } = useGlobalState();
	const [jsonInput, setJsonInput] = useState("");
	/**
	 * Modal controllers
	 */
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleImportJson = () => {
		try {
			const parsed = JSON.parse(jsonInput);
			dispatch(setJsonData(parsed));
			setJsonInput("");
			setIsModalOpen(false);
		} catch {
			toast.error("Invalid JSON format. Please check your input.");
		}
	};

	return (
		<div className='min-h-screen p-4 flex justify-center items-center'>
			<div className='max-w-5xl w-full mx-auto space-y-4'>
				<div className='flex justify-end'>
					<ImportJsonModal
						isModalOpen={isModalOpen}
						setIsModalOpen={setIsModalOpen}
						jsonInput={jsonInput}
						setJsonInput={setJsonInput}
						handleImportJson={handleImportJson}
					/>
				</div>

				<div className='grid grid-cols-2 gap-4 max-h-[calc(100vh-120px)] h-[500px] overflow-auto'>
					<TreeView />

					<Card className='h-full'>
						<CardHeader>
							<CardTitle>JSON</CardTitle>
						</CardHeader>
						<CardContent className='h-full overflow-auto'>
							{jsonData ? (
								<pre className='bg-muted p-4 rounded-md text-sm font-mono'>
									{JSON.stringify(jsonData, null, 2)}
								</pre>
							) : (
								<div className='flex items-center justify-center h-full text-muted-foreground'>
									No JSON data loaded
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default MainContainer;
