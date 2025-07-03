export const BulkOrders = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Bulk Orders</h1>
            <div className="prose max-w-none">
                <p className="text-lg mb-4">
                    Scale your production with our bulk ordering system designed for businesses.
                </p>
                <div className="grid md:grid-cols-2 gap-8 mt-8">
                    <div className="bg-bg-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Volume Discounts</h2>
                        <p>
                            Get competitive pricing for large-scale 3D printing orders with
                            our volume-based discount system.
                        </p>
                    </div>
                    <div className="bg-bg-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Bulk Processing</h2>
                        <p>
                            Streamlined processing and shipping for bulk orders with
                            dedicated project management.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}; 