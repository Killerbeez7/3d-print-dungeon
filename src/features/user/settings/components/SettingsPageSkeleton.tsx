export const SettingsPageSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto min-h-[800px] p-4 flex gap-4 md:flex-row flex-col animate-pulse">
            {/* Sidebar Skeleton */}
            <aside className="md:w-1/4 p-4 bg-bg-surface shadow-md rounded-lg">
                <div className="flex md:flex-col flex-row md:gap-1 gap-5 justify-center items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-bg-secondary"></div>
                    <div className="h-6 w-3/4 mt-2 bg-bg-secondary rounded"></div>
                </div>
                <div className="mt-6 space-y-2">
                    <div className="h-10 bg-bg-secondary rounded-md"></div>
                    <div className="h-10 bg-bg-secondary rounded-md"></div>
                    <div className="h-10 bg-bg-secondary rounded-md"></div>
                    <div className="h-10 bg-bg-secondary rounded-md"></div>
                </div>
            </aside>
            {/* Main Content Skeleton */}
            <section className="md:w-3/4 p-6 bg-bg-surface shadow-md rounded-lg flex-grow">
                <div className="h-8 w-1/3 bg-bg-secondary rounded"></div>
                <div className="mt-6 space-y-4">
                    <div className="h-6 w-full bg-bg-secondary rounded"></div>
                    <div className="h-6 w-2/3 bg-bg-secondary rounded"></div>
                    <div className="h-6 w-1/2 bg-bg-secondary rounded"></div>
                </div>
            </section>
        </div>
    );
};
