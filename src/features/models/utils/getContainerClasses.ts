interface GetContainerClassesProps {
    isIOS: boolean;
    customFullscreen: boolean;
    isFullscreen: boolean;
}

export const getContainerClasses = ({ isIOS, customFullscreen, isFullscreen }: GetContainerClassesProps) => {
	const isFull = (isIOS && customFullscreen) || isFullscreen;
	const baseClasses = "relative w-full overflow-hidden bg-model-viewer-background bg-buildplate";
	const heightClasses = isFull ? "h-screen" : "min-h-[320px] h-[52vh] lg:h-[calc(100vh-15rem)]";
	const borderClasses = isFull ? "" : "rounded-lg border border-br-subtle";
	return `${baseClasses} ${heightClasses} ${borderClasses}`;
};
