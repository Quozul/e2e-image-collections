import { usePasswordContext } from "@/contexts/usePasswordContext.ts";
import { useWorkerContext } from "@/contexts/useWorkerContext.ts";
import { LoaderCircle } from "lucide-react";
import { type HTMLProps, forwardRef, useState } from "react";

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
