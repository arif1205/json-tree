import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const FormattedJsonModal = ({
	isModalOpen,
	setIsModalOpen,
	jsonData,
}: {
	isModalOpen: boolean;
	setIsModalOpen: (isModalOpen: boolean) => void;
	jsonData: unknown;
}) => {
	return (
		<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
			<DialogContent className='max-w-2xl overflow-auto'>
				<DialogHeader>
					<DialogTitle>Import JSON</DialogTitle>
					<DialogDescription>
						Paste your JSON data in the text area below
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-4'>
					<pre className='bg-muted p-4 rounded-md text-sm font-mono'>
						{JSON.stringify(jsonData, null, 2)}
					</pre>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={() => setIsModalOpen(false)}>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default FormattedJsonModal;
