interface GetContainerClassesProps {
    isIOS: boolean;
    customFullscreen: boolean;
    isFullscreen: boolean;
}

export const getContainerClasses = ({ isIOS, customFullscreen, isFullscreen }: GetContainerClassesProps) => {
	const widthClasses = (isIOS && customFullscreen) || isFullscreen ? "w-full" : "w-[100%] ml-0 mr-auto";
	const baseClasses = `relative ${widthClasses} bg-model-viewer-background overflow-hidden`;
	const heightClasses =
		(isIOS && customFullscreen) || isFullscreen
			? "h-screen"
			: "min-h-[320px] h-[45vh] lg:h-[calc(85vh-120px)]";
	const borderClasses =
		!customFullscreen && !isFullscreen
			? "rounded-lg border border-gray-200 dark:border-gray-700"
			: "";
	return `${baseClasses} ${heightClasses} ${borderClasses}`;
};