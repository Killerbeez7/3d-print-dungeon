import PropTypes from 'prop-types';

export default function Skeleton({ className = '' }) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} 
    />
  );
} 

Skeleton.propTypes = {
  className: PropTypes.string,
};
