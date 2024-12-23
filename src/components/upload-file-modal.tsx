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

export default function UploadFileModal() {
	return (
		<Dialog>
			<SidebarMenuButton asChild>
				<DialogTrigger>Upload file</DialogTrigger>
			</SidebarMenuButton>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Upload a file</DialogTitle>
					<DialogDescription>
						This form allows you to upload a file.
					</DialogDescription>
				</DialogHeader>
				<UploadForm />
				<DialogFooter className="sm:justify-start">
					<DialogDescription>
						The file will be encrypted on your device.
					</DialogDescription>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
