

export const Explore = () => {
    return (
        <div className="min-h-screen py-8 px-4">
            <h1 className="text-3xl font-bold text-txt-primary mb-6">Explore</h1>
            <p className="text-txt-secondary leading-relaxed">
                Welcome to the Explore section. Here you can discover a variety
                of models, categories, and curated content. Dive into the world
                of 3D and find inspiration for your own projects.
            </p>
            {/* Example: Some placeholder content, sections, or a grid of items */}
            <div className="mt-4 space-y-4">
                <h2 className="text-xl font-semibold text-txt-primary">
                    Popular Categories
                </h2>
                <ul className="list-disc list-inside text-txt-secondary">
                    <li>Architecture</li>
                    <li>Characters & Creatures</li>
                    <li>Vehicles</li>
                    <li>Nature & Plants</li>
                    {/* etc... */}
                </ul>
            </div>
            {/* Add more content as needed */}
        </div>
    );
};
