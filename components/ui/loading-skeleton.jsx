import React from 'react';
import { Card } from '@/components/ui/card';

// Main loading spinner component
export const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
        {text && <p className="text-muted-foreground text-sm">{text}</p>}
      </div>
    </div>
  );
};

// Page-level loading skeleton
export const PageLoadingSkeleton = ({
  title = true,
  statsCards = 4,
  filterTabs = 5,
  searchBar = true,
  contentCards = 5,
  className = ''
}) => {
  return (
    <div className={`p-2 ${className}`}>
      {/* Header Skeleton */}
      <div className="flex md:flex-row flex-col justify-between px-4">
        <div className="mt-4">
          {title && (
            <>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-20 sm:w-24"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-24 sm:w-32"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-20 sm:w-28"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      {statsCards > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {Array.from({ length: statsCards }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Filter Tabs Skeleton */}
      {filterTabs > 0 && (
        <div className="px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: filterTabs }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded animate-pulse w-16 sm:w-20"></div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter Skeleton */}
      {searchBar && (
        <div className="px-4 py-2">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full sm:w-32"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full sm:w-32"></div>
          </div>
        </div>
      )}

      {/* Content Cards Skeleton */}
      {contentCards > 0 && (
        <div className="px-4 py-2 space-y-4">
          {Array.from({ length: contentCards }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 ml-0 sm:ml-4 mt-4 sm:mt-0">
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-12 sm:w-16"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16 sm:w-20"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-12 sm:w-16"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Table loading skeleton
export const TableLoadingSkeleton = ({ rows = 5, columns = 4, className = '' }) => {
  // Responsive grid classes based on column count
  const getGridCols = (cols) => {
    if (cols <= 2) return 'grid-cols-1 sm:grid-cols-2';
    if (cols <= 3) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    if (cols <= 4) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table header skeleton */}
      <div className={`grid ${getGridCols(columns)} gap-2 sm:gap-4 p-4 bg-gray-50 rounded`}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>

      {/* Table rows skeleton */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`grid ${getGridCols(columns)} gap-2 sm:gap-4 p-4 border rounded`}>
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Card loading skeleton
export const CardLoadingSkeleton = ({
  showAvatar = true,
  showTitle = true,
  showDescription = true,
  showActions = true,
  className = ''
}) => {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
        <div className="space-y-3 flex-1">
          {showAvatar && (
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                {showTitle && <div className="h-5 bg-gray-200 rounded animate-pulse w-24 sm:w-32"></div>}
                {showDescription && <div className="h-4 bg-gray-200 rounded animate-pulse w-32 sm:w-48"></div>}
              </div>
            </div>
          )}
          {!showAvatar && showTitle && (
            <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
          )}
          {!showAvatar && showDescription && (
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          )}
        </div>
        {showActions && (
          <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 sm:ml-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-12 sm:w-16"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16 sm:w-20"></div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Button loading state
export const ButtonLoading = ({ loading, children, className = '', ...props }) => {
  return (
    <button
      className={`${className} ${loading ? 'opacity-75 pointer-events-none' : ''}`}
      disabled={loading}
      {...props}
    >
      {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>}
      {children}
    </button>
  );
};


// Mobile-optimized skeleton for small screens
export const MobileSkeleton = ({
  showHeader = true,
  showCards = 3,
  showList = 5,
  className = ''
}) => {
  return (
    <div className={`p-2 ${className}`}>
      {/* Mobile Header */}
      {showHeader && (
        <div className="px-2 py-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      )}

      {/* Mobile Cards */}
      {showCards > 0 && (
        <div className="space-y-3 px-2">
          {Array.from({ length: showCards }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-3 border">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile List */}
      {showList > 0 && (
        <div className="px-2 py-2">
          {Array.from({ length: showList }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Responsive skeleton that adapts to screen size
export const ResponsiveSkeleton = ({
  mobile = true,
  desktop = true,
  children,
  className = ''
}) => {
  return (
    <div className={className}>
      {mobile && (
        <div className="block sm:hidden">
          <MobileSkeleton />
        </div>
      )}
      {desktop && (
        <div className="hidden sm:block">
          {children || <PageLoadingSkeleton />}
        </div>
      )}
    </div>
  );
};

export const ItemLoadingOverlay = ({ loading, children, text = 'Processing...' }) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">{text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default {
  LoadingSpinner,
  PageLoadingSkeleton,
  TableLoadingSkeleton,
  CardLoadingSkeleton,
  ButtonLoading,
  ItemLoadingOverlay
};
