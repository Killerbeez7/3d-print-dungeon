import InfiniteScroll from "react-infinite-scroll-component";
import PropTypes from "prop-types";
import { Spinner } from "@/components/shared/Spinner";

export function InfiniteScrollList({
    items,
    hasMore,
    loadMore,
    loader = <Spinner size={24} />,
    children,
    ...props
}) {
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
}

InfiniteScrollList.propTypes = {
    items: PropTypes.array.isRequired,
    hasMore: PropTypes.bool.isRequired,
    loadMore: PropTypes.func.isRequired,
    loader: PropTypes.node,
    children: PropTypes.node.isRequired,
};
