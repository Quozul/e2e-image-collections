import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu.tsx";
import { useDeleteCurrentPreview } from "@/hooks/useDeleteCurrentPreview.ts";
import { LoaderCircle, Trash } from "lucide-react";

export function DeleteButton() {
	const deleteCurrentPreview = useDeleteCurrentPreview();

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					<Trash />
					Delete
				</DropdownMenuItem>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						You are about to delete the following file:
						<ul className="my-5">
							<li className="break-all">
								"{deleteCurrentPreview.decryptedName}"
							</li>
						</ul>
						This action cannot be undone and will permanently delete the file
						from our servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={deleteCurrentPreview.handleDelete}
						disabled={deleteCurrentPreview.isLoading}
					>
						{deleteCurrentPreview.isLoading ? (
							<LoaderCircle className="animate-spin" />
						) : (
							<Trash />
						)}
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
