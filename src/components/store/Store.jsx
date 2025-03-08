

export const Store = () => {
    return (
        <div className="min-h-screen py-8 px-4">
            <h1 className="text-3xl font-bold text-txPrimary mb-6">3D Store</h1>
            <p className="text-txSecondary leading-relaxed">
                Welcome to the 3D Store. Here you can browse premium models from
                talented creators around the world. Purchase high-quality assets
                for your games, animations, and more.
            </p>
            {/* Example store listing */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Placeholder items */}
                <div className="bg-bgDarker p-4 shadow rounded">
                    <h3 className="font-semibold">Model #1</h3>
                    <p className="text-sm text-txSecondary">High-res building</p>
                    <button className="mt-2 bg-primary text-white px-3 py-1 rounded hover:bg-hvPrimary">
                        Buy $19
                    </button>
                </div>
                <div className="bg-bgDarker p-4 shadow rounded">
                    <h3 className="font-semibold">Model #2</h3>
                    <p className="text-sm text-txSecondary">Detailed vehicle</p>
                    <button className="mt-2 bg-primary text-white px-3 py-1 rounded hover:bg-hvPrimary">
                        Buy $25
                    </button>
                </div>
                {/* Repeat or map over your store data... */}
            </div>
        </div>
    );
};
