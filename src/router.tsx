import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "./App"
import HomePage from "@/pages/home"
import EditEntityPage from "@/pages/edit-entity"

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
        path: "edit/:type/:id",
        element: <EditEntityPage />,
      },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
