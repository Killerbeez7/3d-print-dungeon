/**
 * A skeleton loader component that mimics the layout of the SettingsPage.
 * This is used as a fallback for Suspense to prevent layout shift.
 */
export const SettingsPageSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto min-h-[800px] p-4 flex gap-4 md:flex-row flex-col animate-pulse">
            {/* Sidebar Skeleton */}
            <aside className="md:w-1/4 p-4 bg-gray-200 dark:bg-gray-700 shadow-md rounded-lg">
                <div className="flex md:flex-col flex-row md:gap-1 gap-5 justify-center items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <div className="h-6 w-3/4 mt-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                <div className="mt-6 space-y-2">
                    <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                    <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                    <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                    <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                </div>
            </aside>
            {/* Main Content Skeleton */}
            <section className="md:w-3/4 p-6 bg-gray-200 dark:bg-gray-700 shadow-md rounded-lg flex-grow">
                <div className="h-8 w-1/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="mt-6 space-y-4">
                    <div className="h-6 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-6 w-2/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
            </section>
        </div>
    );
}; 