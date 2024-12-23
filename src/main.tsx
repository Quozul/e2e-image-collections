import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Router from "@/Router.tsx";
import { PasswordContextProvider } from "@/contexts/PasswordContextProvider.tsx";
import { WorkerContextProvider } from "@/contexts/WorkerContextProvider.tsx";
import { BrowserRouter } from "react-router";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<PasswordContextProvider>
			<WorkerContextProvider>
				<BrowserRouter>
					<Router />
				</BrowserRouter>
			</WorkerContextProvider>
		</PasswordContextProvider>
	</React.StrictMode>,
);
