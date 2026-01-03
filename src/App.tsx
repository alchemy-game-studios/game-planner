import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
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
           <Toaster
             position="bottom-right"
             theme="dark"
             toastOptions={{
               style: {
                 background: '#1a1a1a',
                 border: '1px solid #333',
                 color: '#fff',
               },
             }}
           />
        </div>
    );
}

export default App;