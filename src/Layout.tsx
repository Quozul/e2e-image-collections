import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useWorkerContext } from "@/contexts/useWorkerContext.ts";
import { useDeleteCurrentPreview } from "@/hooks/useDeleteCurrentPreview.ts";
import { LoaderCircle } from "lucide-react";
import { Outlet } from "react-router";

export default function Layout() {
	const deleteCurrentPreview = useDeleteCurrentPreview();
	const worker = useWorkerContext();

	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="flex flex-col h-svh max-h-svh w-full">
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger />
					<Separator orientation="vertical" className="mr-2 h-4" />

					{worker.preview !== null && (
						<div className="text-ellipsis overflow-hidden whitespace-nowrap">
							{worker.preview.name}
						</div>
					)}

					{deleteCurrentPreview.isVisible && (
						<Button
							variant="destructive"
							onClick={deleteCurrentPreview.handleDelete}
							disabled={deleteCurrentPreview.isDisabled}
						>
							{deleteCurrentPreview.isLoading && (
								<LoaderCircle className="animate-spin" />
							)}
							Delete
						</Button>
					)}
				</header>
				<Outlet />
			</main>
		</SidebarProvider>
	);
}
