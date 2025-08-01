import { Download, FileLock, LoaderCircle, Lock, Menu } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router";
import { DeleteButton } from "@/components/delete-button.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { usePasswordContext } from "@/contexts/usePasswordContext.ts";
import { useWorkerContext } from "@/contexts/useWorkerContext.ts";
import { PreviewStatus } from "@/contexts/WorkerContext.ts";
import { Header } from "@/Header.tsx";
import { Preview } from "@/Preview.tsx";
import { download } from "@/utils/download.ts";

export default function File() {
	const { decryptBlob, preview, setPreview, previewStatus, decryptProgress } =
		useWorkerContext();
	const { password, setPassword, setIsPasswordModalOpen } =
		usePasswordContext();
	const { fileId } = useParams();

	useEffect(() => {
		if (fileId) {
			decryptBlob(fileId, password);
		}
	}, [fileId, password, decryptBlob]);

	return (
		<>
			<Header>
				{preview !== null && (
					<>
						<div className="text-ellipsis overflow-hidden whitespace-nowrap">
							{preview.decryptedName}
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline">
									<Menu />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem
									onClick={() => {
										if (preview === null) {
											throw new Error("File must be decrypted for download");
										}
										download(preview.blob, preview.decryptedName);
									}}
								>
									<Download />
									Download
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										setPreview(null);
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
					</>
				)}
			</Header>

			<div className="grow overflow-hidden">
				{previewStatus === PreviewStatus.None && "No file selected"}
				{previewStatus === PreviewStatus.Available && preview !== null && (
					<Preview preview={preview} />
				)}
				{previewStatus === PreviewStatus.Loading && (
					<div className="p-2 flex flex-col items-center gap-2 h-full justify-center">
						<LoaderCircle className="animate-spin" />
						File is currently being downloaded and decrypted.
						<Progress value={decryptProgress * 100} />
					</div>
				)}
				{previewStatus === PreviewStatus.Encrypted && (
					<div className="p-2 flex flex-col items-center gap-2 h-full justify-center">
						<FileLock />
						File is currently encrypted.
						<Button onClick={() => setIsPasswordModalOpen(true)}>
							Enter password to decrypt
						</Button>
					</div>
				)}
			</div>
		</>
	);
}
