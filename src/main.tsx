import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { PasswordContextProvider } from "@/contexts/PasswordContextProvider.tsx";
import { WorkerContextProvider } from "@/contexts/WorkerContextProvider.tsx";
import Router from "@/Router.tsx";

// biome-ignore lint/style/noNonNullAssertion: explanation
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<PasswordContextProvider>
			<WorkerContextProvider>
				<ThemeProvider defaultTheme="system" storageKey="ui-theme">
					<BrowserRouter>
						<Router />
					</BrowserRouter>
				</ThemeProvider>
			</WorkerContextProvider>
		</PasswordContextProvider>
	</React.StrictMode>,
);
