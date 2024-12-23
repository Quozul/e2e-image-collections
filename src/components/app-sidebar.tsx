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

import { usePasswordContext } from "@/contexts/usePasswordContext.ts";
import { useWorkerContext } from "@/contexts/useWorkerContext.ts";
import { LoaderCircle } from "lucide-react";
import { type HTMLProps, forwardRef, useState } from "react";

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
										<OpenFileButton fileName={item} />
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

type Props = {
	fileName: string;
};

export const OpenFileButton = forwardRef<
	HTMLButtonElement,
	Props & HTMLProps<HTMLButtonElement>
>(({ fileName, ...props }, ref) => {
	const worker = useWorkerContext();
	const { password } = usePasswordContext();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleClick = () => {
		setIsLoading(true);
		worker.decryptBlob(fileName, password).finally(() => setIsLoading(false));
	};

	return (
		<button
			{...props}
			ref={ref}
			type="button"
			onClick={handleClick}
			disabled={isLoading}
		>
			{isLoading && <LoaderCircle className="animate-spin" />}

			<span className="text-ellipsis overflow-hidden whitespace-nowrap">
				{fileName}
			</span>
		</button>
	);
});
