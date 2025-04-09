import React from 'react';

export const Enterprise = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Enterprise Solutions</h1>
            <div className="prose max-w-none">
                <p className="text-lg mb-4">
                    Discover our enterprise-grade 3D printing solutions tailored for your business needs.
                </p>
                <div className="grid md:grid-cols-2 gap-8 mt-8">
                    <div className="bg-bg-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Custom Development</h2>
                        <p>
                            Get access to our team of experts for custom 3D printing solutions
                            that match your specific requirements.
                        </p>
                    </div>
                    <div className="bg-bg-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Enterprise Support</h2>
                        <p>
                            24/7 dedicated support, priority processing, and enterprise-grade
                            service level agreements.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}; 