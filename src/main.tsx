import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./style.css";
import "./index.css";

import ContextProvider from "~/contexts";
import Layout from "~/components/Layout";

const App = lazy(() => import("~/components/app/App"));
const CollectionPage = lazy(() => import("~/components/collection/CollectionPage"));
const ImagePage = lazy(() => import("~/components/image/ImagePage"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/collection/:collection",
    element: <CollectionPage />,
  },
  {
    path: "/collection/:collection/image/:image",
    element: <ImagePage />,
  },
  {
    path: "/layout",
    element: <Layout />,
  },
]);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Suspense fallback={"Loading…"}>
      <ContextProvider>
        <RouterProvider router={router} />
      </ContextProvider>
    </Suspense>
  </StrictMode>,
);
