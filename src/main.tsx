import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Router from "@/Router.tsx";
import { WorkerContextProvider } from "@/contexts/WorkerContextProvider.tsx";
import { BrowserRouter } from "react-router";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<BrowserRouter>
			<WorkerContextProvider>
				<Router />
			</WorkerContextProvider>
		</BrowserRouter>
	</React.StrictMode>,
);
