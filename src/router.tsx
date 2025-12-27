import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "./App"
import HomePage from "@/pages/home"
import EditEntityPage from "@/pages/edit-entity"
import ProductsPage from "@/pages/products"
import ProductPage from "@/pages/product"
import LoginPage from "@/pages/login"
import AccountPage from "@/pages/account"
import { ProtectedRoute } from "@/components/protected-route"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "account",
        element: (
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "edit/:type/:id",
        element: <EditEntityPage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "product/:id",
        element: <ProductPage />,
      },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
