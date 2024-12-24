import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarMenuButton } from "@/components/ui/sidebar.tsx";
import UploadForm from "@/components/upload-form.tsx";
import { Upload } from "lucide-react";
import { useState } from "react";

export default function UploadFileModal() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<SidebarMenuButton asChild>
				<DialogTrigger>
					<Upload /> Upload file
				</DialogTrigger>
			</SidebarMenuButton>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Upload a file</DialogTitle>
					<DialogDescription>
						This form allows you to upload a file.
					</DialogDescription>
				</DialogHeader>
				<UploadForm setOpen={setOpen} />
				<DialogFooter className="sm:justify-start">
					<DialogDescription>
						The file will be encrypted on your device.
					</DialogDescription>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
