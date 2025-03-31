import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "./App"
import EditEntityPage from "@/pages/edit-entity"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
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
