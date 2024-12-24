import { Preview } from "@/Preview.tsx";

import { Header } from "@/Header.tsx";
import { DeleteButton } from "@/components/delete-button.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { usePasswordContext } from "@/contexts/usePasswordContext.ts";
import { useWorkerContext } from "@/contexts/useWorkerContext.ts";
import { download } from "@/utils/download.ts";
import { Download, FileLock, Lock, Menu } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router";

export default function File() {
	const { decryptBlob, preview, setPreview } = useWorkerContext();
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
				{preview ? (
					<Preview preview={preview} />
				) : (
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
