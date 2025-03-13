

export const Store = () => {
    return (
        <div className="min-h-screen py-8 px-4">
            <h1 className="text-3xl font-bold text-txt-primary mb-6">3D Store</h1>
            <p className="text-txt-secondary leading-relaxed">
                Welcome to the 3D Store. Here you can browse premium models from
                talented creators around the world. Purchase high-quality assets
                for your games, animations, and more.
            </p>
            {/* Example store listing */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Placeholder items */}
                <div className="bg-bg-surface p-4 shadow rounded-lg">
                    <h3 className="font-medium text-txt-primary">Model #1</h3>
                    <p className="text-sm text-txt-secondary">High-res building</p>
                    <button className="mt-2 bg-btn-secondary font-medium text-txt-primary px-3 py-1 rounded-lg hover:bg-btn-secondary-hover">
                        Buy $19
                    </button>
                </div>
                <div className="bg-bg-surface p-4 shadow rounded-lg">
                    <h3 className="font-medium text-txt-primary">Model #2</h3>
                    <p className="text-sm text-txt-secondary">Detailed vehicle</p>
                    <button className="mt-2 bg-btn-primary font-medium text-white px-3 py-1 rounded-lg hover:bg-btn-primary-hover">
                        Buy $25
                    </button>
                </div>
                <div className="bg-bg-surface p-4 shadow rounded-lg">
                    <h3 className="font-medium text-txt-primary">Model #3</h3>
                    <p className="text-sm text-txt-secondary">Darth Vader lego model</p>
                    <button className="mt-2 bg-btn-disabled font-medium text-txt-secondary px-3 py-1 rounded-lg">
                        Out of stock
                    </button>
                </div>
                {/* Repeat or map over your store data... */}
            </div>
        </div>
    );
};
