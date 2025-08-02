import { Home, Key } from "lucide-react";
import { Link } from "react-router";
import { OpenFileButton } from "@/components/open-file-button.tsx";
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
import { usePasswordContext } from "@/contexts/usePasswordContext.ts";
import { useWorkerContext } from "@/contexts/useWorkerContext.ts";

export function AppSidebar() {
	const { fileList } = useWorkerContext();
	const { setIsPasswordModalOpen } = usePasswordContext();

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
						{fileList.length === 0 && (
							<SidebarMenuItem>
								<UploadFileModal />
							</SidebarMenuItem>
						)}
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={() => setIsPasswordModalOpen(true)}>
							<Key />
							Change decryption password
						</SidebarMenuButton>
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
