import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ListItem } from "@/hooks/useList.ts";
import { Lock } from "lucide-react";
import { type HTMLProps, forwardRef } from "react";
import { Link } from "react-router";

type Props = {
	item: ListItem;
};

export const OpenFileButton = forwardRef<
	HTMLAnchorElement,
	Props & HTMLProps<HTMLAnchorElement>
>(({ item, ...props }, ref) => {
	const displayName = item.decryptedName ?? item.encryptedName;
	const isLocked = item.decryptedName === null;

	return (
		<TooltipProvider>
			<Link
				{...props}
				ref={ref}
				type="button"
				to={`/file/${item.encryptedName}`}
			>
				{isLocked && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Lock />
						</TooltipTrigger>
						<TooltipContent>
							<p>This file is encrypted</p>
						</TooltipContent>
					</Tooltip>
				)}

				<Tooltip>
					<TooltipTrigger asChild>
						<span className="text-ellipsis overflow-hidden whitespace-nowrap">
							{displayName}
						</span>
					</TooltipTrigger>
					<TooltipContent>{displayName}</TooltipContent>
				</Tooltip>
			</Link>
		</TooltipProvider>
	);
});
