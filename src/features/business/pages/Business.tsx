import { Outlet, useLocation } from "react-router-dom";

export const Business = () => {
    const location = useLocation();
    const isRootPath: boolean = location.pathname === "/business";

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Business Solutions</h1>

            {isRootPath ? (
                // Show business landing content when on root business path
                <div>
                    <p className="text-txt-secondary leading-relaxed mb-6">
                        Explore our enterprise solutions for 3D content management.
                        Collaborate with your team, streamline workflows, and optimize
                        your 3D strategy for maximum impact.
                    </p>
                    <ul className="mt-4 space-y-2 text-txt-secondary list-disc list-inside">
                        <li>Team-based content management</li>
                        <li>Secure cloud storage & version control</li>
                        <li>Dedicated support & enterprise SLAs</li>
                        <li>AR/VR integration & advanced analytics</li>
                    </ul>
                </div>
            ) : (
                // Show nested route content for sub-paths
                <Outlet />
            )}
        </div>
    );
};
