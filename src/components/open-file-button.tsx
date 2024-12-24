import { usePasswordContext } from "@/contexts/usePasswordContext.ts";
import { useWorkerContext } from "@/contexts/useWorkerContext.ts";
import type { ListItem } from "@/hooks/useList.ts";
import { LoaderCircle, Lock } from "lucide-react";
import { type HTMLProps, forwardRef, useState } from "react";

type Props = {
	item: ListItem;
};

export const OpenFileButton = forwardRef<
	HTMLButtonElement,
	Props & HTMLProps<HTMLButtonElement>
>(({ item, ...props }, ref) => {
	const worker = useWorkerContext();
	const { password } = usePasswordContext();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleClick = () => {
		setIsLoading(true);
		worker
			.decryptBlob(item.encryptedName, password)
			.finally(() => setIsLoading(false));
	};

	const displayName = item.decryptedName ?? item.encryptedName;
	const isLocked = item.decryptedName === null;

	return (
		<button
			{...props}
			ref={ref}
			type="button"
			onClick={handleClick}
			disabled={isLoading}
			title={displayName}
		>
			{isLoading && <LoaderCircle className="animate-spin" />}
			{isLocked && <Lock />}

			<span className="text-ellipsis overflow-hidden whitespace-nowrap">
				{displayName}
			</span>
		</button>
	);
});
