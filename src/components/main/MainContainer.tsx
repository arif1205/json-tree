import { useAppDispatch } from "@/hooks/store/useStore.hooks";
import { setJsonData } from "@/store/slice/global/globalSlice";
import { useState } from "react";
import { toast } from "sonner";
import ImportJsonModal from "../modal/import/ImportJson.modal";
import ObjectView from "../object-view/ObjectView";
import TreeView from "../tree-view/TreeView";
import { Button } from "../ui/button";
import { Eye, Import } from "lucide-react";
import { useGlobalState } from "@/hooks/store/useGlobalStore.hooks";
import FormattedJsonModal from "../modal/formatted-json/FormattedJson.modal";

const MainContainer = () => {
	const dispatch = useAppDispatch();
	const { jsonData } = useGlobalState();
	const [jsonInput, setJsonInput] = useState("");
	/**
	 * Modal controllers
	 */
	const [isImportJsonModalOpen, setIsImportJsonModalOpen] = useState(false);
	const [isFormattedJsonModalOpen, setIsFormattedJsonModalOpen] =
		useState(false);

	const handleImportJson = () => {
		try {
			const parsed = JSON.parse(jsonInput);
			dispatch(setJsonData(parsed));
			setJsonInput("");
			setIsImportJsonModalOpen(false);
		} catch {
			toast.error("Invalid JSON format. Please check your input.");
			setIsImportJsonModalOpen(false);
		}
	};

	return (
		<div className='min-h-screen p-4 flex justify-center items-center'>
			<div className='max-w-5xl w-full mx-auto space-y-4'>
				<div className='flex justify-end gap-2'>
					<Button
						onClick={() => setIsFormattedJsonModalOpen(true)}
						variant={"outline"}
						size={"sm"}
						disabled={!jsonData}>
						<Eye className='size-4 mr-2' />
						View Formatted JSON
					</Button>
					<Button onClick={() => setIsImportJsonModalOpen(true)} size={"sm"}>
						<Import className='size-4 mr-2' />
						Import
					</Button>
				</div>

				<div className='grid grid-cols-2 gap-4 max-h-[calc(100vh-120px)] h-[500px] overflow-auto'>
					<TreeView />
					<ObjectView />
				</div>
			</div>

			<ImportJsonModal
				isModalOpen={isImportJsonModalOpen}
				setIsModalOpen={() => {
					setIsImportJsonModalOpen(false);
					setJsonInput("");
				}}
				jsonInput={jsonInput}
				setJsonInput={setJsonInput}
				handleImportJson={handleImportJson}
			/>
			<FormattedJsonModal
				isModalOpen={isFormattedJsonModalOpen}
				setIsModalOpen={() => {
					setIsFormattedJsonModalOpen(false);
				}}
				jsonData={jsonData}
			/>
		</div>
	);
};

export default MainContainer;
