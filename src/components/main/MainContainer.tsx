import { useGlobalState } from "@/hooks/store/useGlobalStore.hooks";
import { useAppDispatch } from "@/hooks/store/useStore.hooks";
import { setJsonData } from "@/store/slice/global/globalSlice";
import { useState } from "react";
import ImportJsonModal from "../modal/import/ImportJson.modal";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const MainContainer = () => {
	const dispatch = useAppDispatch();
	const { jsonData } = useGlobalState();
	const [error, setError] = useState<string | null>(null);
	const [jsonInput, setJsonInput] = useState("");
	/**
	 * Modal controllers
	 */
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleImportJson = () => {
		setError(null);
		try {
			const parsed = JSON.parse(jsonInput);
			dispatch(setJsonData(parsed));
			setJsonInput("");
			setIsModalOpen(false);
		} catch (err) {
			setError("Invalid JSON format. Please check your input.");
			console.error("JSON parse error:", err);
		}
	};

	return (
		<div className='min-h-screen p-4'>
			<div className='max-w-7xl mx-auto space-y-4'>
				{/* Import Button */}
				<div className='flex justify-end'>
					<ImportJsonModal
						isModalOpen={isModalOpen}
						setIsModalOpen={setIsModalOpen}
						jsonInput={jsonInput}
						setJsonInput={setJsonInput}
						error={error}
						handleImportJson={handleImportJson}
					/>
				</div>

				{/* Two Boxes Layout */}
				<div className='grid grid-cols-2 gap-4 h-[calc(100vh-120px)]'>
					{/* Left Box - Tree View */}
					<Card className='h-full'>
						<CardHeader>
							<CardTitle>Tree</CardTitle>
						</CardHeader>
						<CardContent className='h-[calc(100%-80px)] overflow-auto'>
							{/* Tree content will go here */}
						</CardContent>
					</Card>

					{/* Right Box - JSON View */}
					<Card className='h-full'>
						<CardHeader>
							<CardTitle>JSON</CardTitle>
						</CardHeader>
						<CardContent className='h-[calc(100%-80px)] overflow-auto'>
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
