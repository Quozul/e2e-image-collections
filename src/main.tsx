import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/app/App.tsx";
import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Collection from "./components/collection/Collection.tsx";
import CryptoContextProvider from "./components/CryptoContext.tsx";
import Image from "./components/image/Image.tsx";

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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <CryptoContextProvider>
      <RouterProvider router={router} />
    </CryptoContextProvider>
  </React.StrictMode>,
);
