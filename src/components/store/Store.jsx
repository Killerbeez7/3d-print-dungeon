import { Outlet } from "react-router-dom";

export const Store = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Store</h1>
            {/* Render nested routes */}
            <Outlet />
        </div>
    );
};
