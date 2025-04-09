export const CustomSolutions = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Custom Solutions</h1>
            <div className="prose max-w-none">
                <p className="text-lg mb-4">
                    Tailored 3D printing solutions to meet your unique business requirements.
                </p>
                <div className="grid md:grid-cols-2 gap-8 mt-8">
                    <div className="bg-bg-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Custom Development</h2>
                        <p>
                            Work with our experts to develop custom 3D printing solutions
                            that perfectly match your specifications.
                        </p>
                    </div>
                    <div className="bg-bg-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Consultation</h2>
                        <p>
                            Get professional consultation on materials, processes, and
                            optimization for your specific use case.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}; 