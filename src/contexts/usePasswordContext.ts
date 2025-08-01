import { useContext } from "react";
import { PasswordContext } from "@/contexts/PasswordContext.ts";

export function usePasswordContext() {
	return useContext(PasswordContext);
}
