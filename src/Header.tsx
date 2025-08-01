import type { PropsWithChildren } from "react";
import { Separator } from "@/components/ui/separator.tsx";
import { SidebarTrigger } from "@/components/ui/sidebar.tsx";

export function Header({ children }: PropsWithChildren) {
	return (
		<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
			<SidebarTrigger />
			<Separator orientation="vertical" className="mr-2 h-4" />

			{children && (
				<div className="flex justify-between w-full items-center">
					{children}
				</div>
			)}
		</header>
	);
}
