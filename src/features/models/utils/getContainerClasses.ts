interface GetContainerClassesProps {
    isIOS: boolean;
    customFullscreen: boolean;
    isFullscreen: boolean;
}

export const getContainerClasses = ({ isIOS, customFullscreen, isFullscreen }: GetContainerClassesProps) => {
    const baseClasses =
        "relative w-full bg-gray-100 dark:bg-gray-800 overflow-hidden";
    const heightClasses =
        (isIOS && customFullscreen) || isFullscreen
            ? "h-screen"
            : "min-h-[300px] h-[40vh] lg:h-[calc(80vh-120px)]";
    const borderClasses =
        !customFullscreen && !isFullscreen
            ? "rounded-lg border border-gray-200 dark:border-gray-700"
            : "";
    return `${baseClasses} ${heightClasses} ${borderClasses}`;
};