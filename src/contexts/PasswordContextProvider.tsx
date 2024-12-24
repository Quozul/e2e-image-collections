import {
	PasswordContext,
	type PasswordContextType,
} from "@/contexts/PasswordContext.ts";
import { type PropsWithChildren, useCallback, useState } from "react";

export function PasswordContextProvider({ children }: PropsWithChildren) {
	const [password, setPassword] = useState("");
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

	const handleSetPassword = useCallback((newPassword: string) => {
		setPassword(newPassword);
	}, []);

	const handlePasswordModalStateChange = (isOpen: boolean) => {
		setIsPasswordModalOpen(isOpen);
	};

	const value: PasswordContextType = {
		password,
		setPassword: handleSetPassword,
		isPasswordModalOpen,
		setIsPasswordModalOpen: handlePasswordModalStateChange,
	};

	return (
		<PasswordContext.Provider value={value}>
			{children}
		</PasswordContext.Provider>
	);
}
