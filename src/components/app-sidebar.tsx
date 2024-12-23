import SetPasswordModal from "@/components/set-password-modal.tsx";
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

export function AppSidebar() {
	const worker = useWorkerContext();

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Files</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{worker.fileList.map((item) => (
								<SidebarMenuItem key={item}>
									<SidebarMenuButton asChild>
										<button
											type="button"
											onClick={() => worker.decryptBlob(item, worker.password)}
										>
											<span className="text-ellipsis overflow-hidden whitespace-nowrap">
												{item}
											</span>
										</button>
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
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
