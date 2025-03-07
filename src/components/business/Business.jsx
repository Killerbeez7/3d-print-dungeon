

export const Business = () => {
    return (
        <div className="min-h-screen py-8 px-4">
            <h1 className="text-3xl font-bold text-txPrimary mb-6">Business</h1>
            <p className="text-txSecondary leading-relaxed">
                Explore our enterprise solutions for 3D content management.
                Collaborate with your team, streamline workflows, and optimize
                your 3D strategy for maximum impact.
            </p>
            {/* Example: bullet points or feature list */}
            <ul className="mt-4 space-y-2 text-txSecondary">
                <li>• Team-based content management</li>
                <li>• Secure cloud storage & version control</li>
                <li>• Dedicated support & enterprise SLAs</li>
                <li>• AR/VR integration & advanced analytics</li>
            </ul>
            {/* Add more business details, pricing, contact info, etc. */}
        </div>
    );
};
