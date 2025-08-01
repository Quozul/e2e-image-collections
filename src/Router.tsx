import { Route, Routes } from "react-router";
import Layout from "@/Layout.tsx";
import File from "@/pages/File.tsx";
import Home from "@/pages/Home.tsx";

export default function Router() {
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route index element={<Home />} />
				<Route path="/file/:fileId" element={<File />} />
			</Route>
		</Routes>
	);
}
