import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog.tsx";
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
import { useWorkerContext } from "@/contexts/useWorkerContext.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	password: z.string().min(2, {
		message: "Title must be at least 2 characters.",
	}),
});

export default function PasswordForm() {
	const worker = useWorkerContext();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: worker.password,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (worker.password !== values.password) {
			worker.setPassword(values.password);
		}
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

				<DialogClose asChild>
					<Button type="submit" disabled={form.formState.isSubmitting}>
						{form.formState.isSubmitting && (
							<LoaderCircle className="animate-spin" />
						)}
						Upload
					</Button>
				</DialogClose>
			</form>
		</Form>
	);
}
