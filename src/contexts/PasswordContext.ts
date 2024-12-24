import { type Dispatch, type SetStateAction, createContext } from "react";

export type PasswordContextType = {
	password: string;
	setPassword: Dispatch<SetStateAction<string>>;
	isPasswordModalOpen: boolean;
	setIsPasswordModalOpen: Dispatch<SetStateAction<boolean>>;
};

const Noop = () => void 0;

const defaultValue: PasswordContextType = {
	setPassword: Noop,
	password: "",
	isPasswordModalOpen: false,
	setIsPasswordModalOpen: Noop,
};

export const PasswordContext = createContext(defaultValue);
