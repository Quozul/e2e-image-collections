import { Outlet } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner.tsx";

export default function Layout() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="flex flex-col h-svh max-h-svh w-full">
				<Outlet />
			</main>
			<Toaster />
		</SidebarProvider>
	);
}
