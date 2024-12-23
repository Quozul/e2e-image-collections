import { PasswordContext } from "@/contexts/PasswordContext.ts";
import { useContext } from "react";

export function usePasswordContext() {
	return useContext(PasswordContext);
}
