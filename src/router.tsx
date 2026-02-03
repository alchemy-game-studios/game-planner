import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "./App"
import HomePage from "@/pages/home"
import EditEntityPage from "@/pages/edit-entity"
import EditProductPage from "@/pages/edit-product"
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
        path: "edit/product/:id",
        element: <EditProductPage />,
      },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
