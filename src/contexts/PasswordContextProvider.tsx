import {
	type NewPasswordCallback,
	PasswordContext,
	type PasswordContextType,
} from "@/contexts/PasswordContext.ts";
import { type PropsWithChildren, useCallback, useState } from "react";

export function PasswordContextProvider({ children }: PropsWithChildren) {
	const [password, setPassword] = useState("");
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
	const [newPasswordCallback, setNewPasswordCallback] =
		useState<NewPasswordCallback | null>(null);

	const requestNewPassword = useCallback((callback: NewPasswordCallback) => {
		setIsPasswordModalOpen(true);
		setNewPasswordCallback(() => callback);
	}, []);

	const handleSetPassword = useCallback(
		(newPassword: string) => {
			setPassword(newPassword);
			if (newPasswordCallback) {
				newPasswordCallback(newPassword);
				setNewPasswordCallback(null);
			}
		},
		[newPasswordCallback],
	);

	const handlePasswordModalStateChange = (isOpen: boolean) => {
		setIsPasswordModalOpen(isOpen);
		if (!isOpen) {
			setNewPasswordCallback(null);
		}
	};

	const value: PasswordContextType = {
		password,
		setPassword: handleSetPassword,
		isPasswordModalOpen,
		setIsPasswordModalOpen: handlePasswordModalStateChange,
		requestNewPassword,
	};

	return (
		<PasswordContext.Provider value={value}>
			{children}
		</PasswordContext.Provider>
	);
}
