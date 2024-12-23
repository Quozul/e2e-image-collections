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
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	password: z.string().min(2, {
		message: "Password must be at least 2 characters.",
	}),
});

export default function PasswordForm() {
	const { setPassword, password, setIsPasswordModalOpen } =
		usePasswordContext();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: password,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (password !== values.password) {
			setPassword(values.password);
			setIsPasswordModalOpen(false);
		} else {
			form.setError("password", {
				message: "Password must be different than the previous one.",
			});
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

				<Button type="submit" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting && (
						<LoaderCircle className="animate-spin" />
					)}
					Set password
				</Button>
			</form>
		</Form>
	);
}
