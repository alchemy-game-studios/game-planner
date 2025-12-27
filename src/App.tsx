import { Outlet, useLocation } from "react-router-dom";
import { Breadcrumbs } from "@/components/breadcrumbs";

const App = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div className="app">
           <Breadcrumbs />
           {/* Spacer for fixed breadcrumbs (not needed on home) */}
           {!isHome && <div className="h-10" />}
           <Outlet />
        </div>
    );
}

export default App;