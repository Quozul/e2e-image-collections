import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

import CollectionPage from "~/components/collection/CollectionPage";
import CryptoContextProvider from "~/components/CryptoContext";
import ImagePage from "~/components/image/ImagePage";
import App from "~/components/app/App";

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
]);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <CryptoContextProvider>
      <RouterProvider router={router} />
    </CryptoContextProvider>
  </StrictMode>,
);
