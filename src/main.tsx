import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

import Collection from "~/components/collection/Collection";
import CryptoContextProvider from "~/components/CryptoContext";
import Image from "~/components/image/Image";
import App from "~/components/app/App";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/collection/:collection",
    element: <Collection />,
  },
  {
    path: "/collection/:collection/image/:image",
    element: <Image />,
  },
]);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <CryptoContextProvider>
      <RouterProvider router={router} />
    </CryptoContextProvider>
  </StrictMode>,
);
