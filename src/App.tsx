import { Outlet } from "react-router-dom";
import { Breadcrumbs } from "@/components/breadcrumbs";

const App = () => {
    return (
        <div className="app">
           <Breadcrumbs />
           {/* Spacer for fixed breadcrumbs */}
           <div className="h-10" />
           <Outlet />
        </div>
    );
}

export default App;