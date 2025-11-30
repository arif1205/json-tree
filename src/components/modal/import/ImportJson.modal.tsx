import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Import } from "lucide-react";

const ImportJsonModal = ({
	isModalOpen,
	setIsModalOpen,
	jsonInput,
	setJsonInput,
	error,
	handleImportJson,
}: {
	isModalOpen: boolean;
	setIsModalOpen: (isModalOpen: boolean) => void;
	jsonInput: string;
	setJsonInput: (jsonInput: string) => void;
	error: string | null;
	handleImportJson: () => void;
}) => {
	return (
		<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
			<DialogTrigger asChild>
				<Button>
					<Import className='size-4 mr-2' />
					Import
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle>Import JSON</DialogTitle>
					<DialogDescription>
						Paste your JSON data in the text area below
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-4'>
					<Textarea
						id='json-input'
						value={jsonInput}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
							setJsonInput(e.target.value)
						}
						placeholder='Paste JSON data here...'
						className='min-h-[300px]'
					/>
					{error && (
						<div className='p-3 rounded-md bg-destructive/10 text-destructive text-sm'>
							{error}
						</div>
					)}
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={() => setIsModalOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleImportJson}>Import</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ImportJsonModal;
