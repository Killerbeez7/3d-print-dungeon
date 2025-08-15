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
                {/* Header */}
                <div className="mb-6">
                    <div className="h-8 w-1/3 bg-bg-secondary rounded mb-2"></div>
                    <div className="h-4 w-2/3 bg-bg-secondary rounded"></div>
                </div>
                
                {/* Settings Cards */}
                <div className="space-y-6">
                    {/* First Settings Card */}
                    <div className="bg-bg-secondary rounded-lg border border-br-secondary p-6">
                        <div className="h-6 w-1/4 bg-bg-surface rounded mb-4"></div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-4 border-b border-br-secondary">
                                <div className="flex-1">
                                    <div className="h-4 w-1/3 bg-bg-surface rounded mb-1"></div>
                                    <div className="h-3 w-2/3 bg-bg-surface rounded"></div>
                                </div>
                                <div className="ml-4 h-6 w-24 bg-bg-surface rounded"></div>
                            </div>
                            <div className="flex items-center justify-between py-4 border-b border-br-secondary">
                                <div className="flex-1">
                                    <div className="h-4 w-1/3 bg-bg-surface rounded mb-1"></div>
                                    <div className="h-3 w-2/3 bg-bg-surface rounded"></div>
                                </div>
                                <div className="ml-4 h-6 w-24 bg-bg-surface rounded"></div>
                            </div>
                            <div className="flex items-center justify-between py-4">
                                <div className="flex-1">
                                    <div className="h-4 w-1/3 bg-bg-surface rounded mb-1"></div>
                                    <div className="h-3 w-2/3 bg-bg-surface rounded"></div>
                                </div>
                                <div className="ml-4 h-6 w-24 bg-bg-surface rounded"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Second Settings Card */}
                    <div className="bg-bg-secondary rounded-lg border border-br-secondary p-6">
                        <div className="h-6 w-1/4 bg-bg-surface rounded mb-4"></div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-4 border-b border-br-secondary">
                                <div className="flex-1">
                                    <div className="h-4 w-1/2 bg-bg-surface rounded mb-1"></div>
                                    <div className="h-3 w-3/4 bg-bg-surface rounded"></div>
                                </div>
                                <div className="ml-4 h-6 w-11 bg-bg-surface rounded-full"></div>
                            </div>
                            <div className="flex items-center justify-between py-4 border-b border-br-secondary">
                                <div className="flex-1">
                                    <div className="h-4 w-1/2 bg-bg-surface rounded mb-1"></div>
                                    <div className="h-3 w-3/4 bg-bg-surface rounded"></div>
                                </div>
                                <div className="ml-4 h-6 w-11 bg-bg-surface rounded-full"></div>
                            </div>
                            <div className="flex items-center justify-between py-4">
                                <div className="flex-1">
                                    <div className="h-4 w-1/2 bg-bg-surface rounded mb-1"></div>
                                    <div className="h-3 w-3/4 bg-bg-surface rounded"></div>
                                </div>
                                <div className="ml-4 h-6 w-24 bg-bg-surface rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
