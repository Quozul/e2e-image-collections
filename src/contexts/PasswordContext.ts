import { createContext } from "react";

export type NewPasswordCallback = (newPassword: string) => void;

export type PasswordContextType = {
	password: string;
	setPassword: (newPassword: string) => void;
	isPasswordModalOpen: boolean;
	setIsPasswordModalOpen: (isOpen: boolean) => void;
	requestNewPassword: (callback: NewPasswordCallback) => void;
};

const Noop = () => void 0;

const defaultValue: PasswordContextType = {
	setPassword: Noop,
	password: "",
	isPasswordModalOpen: false,
	setIsPasswordModalOpen: Noop,
	requestNewPassword: Noop,
};

export const PasswordContext = createContext(defaultValue);
