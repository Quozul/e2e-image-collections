import { OpenFileButton } from "@/components/open-file-button.tsx";
import SetPasswordModal from "@/components/set-password-modal.tsx";
import { ThemeToggle } from "@/components/theme-toggle.tsx";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import UploadFileModal from "@/components/upload-file-modal.tsx";
import { useWorkerContext } from "@/contexts/useWorkerContext.ts";
import { Home } from "lucide-react";
import { Link } from "react-router";

export function AppSidebar() {
	const { fileList } = useWorkerContext();

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Application</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link to="/" type="button">
										<Home />
										Home
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Files</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{fileList.map((item) => (
								<SidebarMenuItem key={item.encryptedName}>
									<SidebarMenuButton asChild>
										<OpenFileButton item={item} />
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SetPasswordModal />
					</SidebarMenuItem>
					<SidebarMenuItem>
						<UploadFileModal />
					</SidebarMenuItem>
					<SidebarMenuItem>
						<ThemeToggle />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
