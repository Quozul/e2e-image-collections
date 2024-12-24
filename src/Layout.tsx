import { AppSidebar } from "@/components/app-sidebar";
import { DeleteButton } from "@/components/delete-button.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner.tsx";
import { usePasswordContext } from "@/contexts/usePasswordContext.ts";
import { useWorkerContext } from "@/contexts/useWorkerContext.ts";
import { Lock, Menu } from "lucide-react";
import { Outlet } from "react-router";

export default function Layout() {
	const worker = useWorkerContext();
	const { setPassword } = usePasswordContext();

	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="flex flex-col h-svh max-h-svh w-full">
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger />
					<Separator orientation="vertical" className="mr-2 h-4" />

					<div className="flex justify-between w-full items-center">
						{worker.preview !== null && (
							<div className="text-ellipsis overflow-hidden whitespace-nowrap">
								{worker.preview.decryptedName}
							</div>
						)}

						{worker.preview !== null && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline">
										<Menu />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem
										onClick={() => {
											worker.setPreview(null);
											setPassword("");
										}}
									>
										<Lock />
										Lock
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DeleteButton />
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</header>
				<Outlet />
			</main>
			<Toaster />
		</SidebarProvider>
	);
}
