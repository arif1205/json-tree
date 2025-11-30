import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title?: string;
	description?: string;
	itemName?: string;
}

const DeleteConfirmModal = ({
	isOpen,
	onClose,
	onConfirm,
	title = "Delete Item",
	description,
	itemName,
}: DeleteConfirmModalProps) => {
	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<div className='flex items-center gap-3'>
						<div className='flex items-center justify-center size-10 rounded-full bg-destructive/10'>
							<AlertTriangle className='size-5 text-destructive' />
						</div>
						<div>
							<DialogTitle>{title}</DialogTitle>
							<DialogDescription className='mt-1'>
								{description ||
									(itemName
										? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
										: "Are you sure you want to delete this item? This action cannot be undone.")}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<DialogFooter>
					<Button variant='outline' onClick={onClose}>
						Cancel
					</Button>
					<Button variant='destructive' onClick={handleConfirm}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteConfirmModal;

