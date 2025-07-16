import React, { ReactNode } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Spinner } from "@/features/shared/reusable/Spinner";

export interface InfiniteScrollListProps {
    items: unknown[];
    hasMore: boolean;
    loadMore: () => void;
    loader?: ReactNode;
    children: ReactNode;
    [key: string]: unknown;
}

export const InfiniteScrollList = ({
    items,
    hasMore,
    loadMore,
    loader = <Spinner size={24} />,
    children,
    ...props
}: InfiniteScrollListProps) => {
    return (
        <InfiniteScroll
            dataLength={items.length}
            next={loadMore}
            hasMore={hasMore}
            loader={loader}
            {...props}
        >
            {children}
        </InfiniteScroll>
    );
};
