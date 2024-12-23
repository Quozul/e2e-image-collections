import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { usePasswordContext } from "@/contexts/usePasswordContext.ts";
import { useWorkerContext } from "@/contexts/useWorkerContext.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	password: z.string().min(2, {
		message: "Password must be at least 2 characters.",
	}),
	file: z
		.instanceof(FileList)
		.refine((file) => file?.length === 1, "Exactly one file must be selected."),
});

type Props = {
	setOpen: (open: boolean) => void;
};

export default function UploadForm({ setOpen }: Props) {
	const worker = useWorkerContext();
	const { password, setPassword } = usePasswordContext();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: password,
			file: undefined,
		},
	});

	const fileRef = form.register("file");

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (password !== values.password) {
			setPassword(values.password);
		}

		for (const file of values.file) {
			await worker.encryptBlob(file, values.password);
		}

		setOpen(false);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input
									type="password"
									placeholder="sup3rS3cr3tP4ssw0rd!"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								The password used to encrypt your file. Make sure to remember it
								as it cannot be recovered!
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="file"
					render={() => (
						<FormItem>
							<FormLabel>File</FormLabel>
							<FormControl>
								<Input type="file" {...fileRef} />
							</FormControl>
							<FormDescription>
								Select the file you would like to upload.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting && (
						<LoaderCircle className="animate-spin" />
					)}
					Upload
				</Button>
			</form>
		</Form>
	);
}
