import PasswordForm from "@/components/password-form.tsx";
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

export default function SetPasswordModal() {
	return (
		<Dialog>
			<SidebarMenuButton asChild>
				<DialogTrigger>Change password</DialogTrigger>
			</SidebarMenuButton>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change password</DialogTitle>
					<DialogDescription>
						Use this form if you would like to set the decryption password.
					</DialogDescription>
				</DialogHeader>
				<PasswordForm />
				<DialogFooter className="sm:justify-start">
					<DialogDescription>
						The password is only stored in memory and not persisted.
					</DialogDescription>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
