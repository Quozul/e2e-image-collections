import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./style.css";
import "./index.css";

import CollectionPage from "~/components/collection/CollectionPage";
import CryptoContextProvider from "~/components/CryptoContext";
import ImagePage from "~/components/image/ImagePage";
import App from "~/components/app/App";
import NewImagePage from "~/components/image/NewImagePage";
import CacheProvider from "~/components/CacheContext";
import CollectionProvider from "~/components/CollectionContext";

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
    path: "/collection/:collection/oldimage/:image",
    element: <ImagePage />,
  },
  {
    path: "/collection/:collection/image/:image",
    element: <NewImagePage />,
  },
]);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <CryptoContextProvider>
      <CacheProvider>
        <CollectionProvider>
          <RouterProvider router={router} />
        </CollectionProvider>
      </CacheProvider>
    </CryptoContextProvider>
  </StrictMode>,
);
