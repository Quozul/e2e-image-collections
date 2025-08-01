import { type PropsWithChildren, useState } from "react";
import {
	PasswordContext,
	type PasswordContextType,
} from "@/contexts/PasswordContext.ts";

export function PasswordContextProvider({ children }: PropsWithChildren) {
	const [password, setPassword] = useState("");
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

	const value: PasswordContextType = {
		password,
		setPassword,
		isPasswordModalOpen,
		setIsPasswordModalOpen,
	};

	return (
		<PasswordContext.Provider value={value}>
			{children}
		</PasswordContext.Provider>
	);
}
