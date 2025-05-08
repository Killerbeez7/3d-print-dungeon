import InfiniteScroll from 'react-infinite-scroll-component';
import PropTypes from 'prop-types';
export function InfiniteScrollList({
  items,
  hasMore,
  loadMore,
  loader = <p className="text-center my-4">Loading...</p>,
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
