import { Outlet } from "react-router-dom"
import './App.scss'

const App = () => {
  return (
    <div className="app bg-gray-900 text-white p-4 pr-0 rounded">
      <div className="panel">
        <Outlet /> {/* This renders route-specific content */}
      </div>
    </div>
  )
}

export default App
