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

import { Button } from "@/components/ui/button.tsx";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu.tsx";
import { useDeleteCurrentPreview } from "@/hooks/useDeleteCurrentPreview.ts";
import { LoaderCircle, Trash } from "lucide-react";

export function DeleteButton() {
	const deleteCurrentPreview = useDeleteCurrentPreview();

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()} asChild>
					<Button variant="destructive" className="w-full justify-start">
						<Trash />
						Delete
					</Button>
				</DropdownMenuItem>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete the file
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
