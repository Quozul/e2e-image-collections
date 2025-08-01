import { FileIcon, FileLock } from "lucide-react";
import { Link } from "react-router";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { useWorkerContext } from "@/contexts/useWorkerContext.ts";
import { Header } from "@/Header.tsx";

export default function Home() {
	const { fileList } = useWorkerContext();
	return (
		<>
			<Header />

			<div className="flex flex-col gap-2 p-2 xl:p-4">
				<div className="flex flex-col">
					<h1 className="text-4xl font-bold leading-tight">Welcome back!</h1>
					<h2 className="text-xl leading-tight">
						You have {fileList.length} uploaded files.
					</h2>
				</div>

				<div className="grid grid-cols-3 2xl:grid-cols-6 gap-1 xl:gap-2 mt-4">
					{fileList.map((item) => {
						const displayName = item.decryptedName ?? item.encryptedName;
						const isLocked = item.decryptedName === null;

						return (
							<Link
								key={item.encryptedName}
								to={`/file/${item.encryptedName}`}
								className="rounded border p-2 flex flex-col gap-2"
							>
								<div className="aspect-square flex justify-center items-center rounded">
									{isLocked ? <FileLock /> : <FileIcon />}
								</div>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<span className="text-ellipsis overflow-hidden whitespace-nowrap">
												{displayName}
											</span>
										</TooltipTrigger>
										<TooltipContent>{displayName}</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</Link>
						);
					})}
				</div>
			</div>
		</>
	);
}
