

export const ProductSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-300 rounded-lg h-48 w-full"></div>
      <div className="mt-4">
        <div className="bg-gray-300 h-4 w-3/4 rounded"></div>
        <div className="bg-gray-300 h-4 w-1/2 mt-2 rounded"></div>
        <div className="bg-gray-300 h-4 w-1/4 mt-2 rounded"></div>
      </div>
    </div>
  );
};

// Skeleton for Sidebar Filters
export const SidebarSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-300 h-6 w-3/4 rounded mb-4"></div>
      <div className="bg-gray-300 h-4 w-full rounded mb-2"></div>
      <div className="bg-gray-300 h-4 w-full rounded mb-2"></div>
      <div className="bg-gray-300 h-4 w-full rounded mb-2"></div>
      <div className="bg-gray-300 h-6 w-3/4 rounded mt-6 mb-4"></div>
      <div className="bg-gray-300 h-4 w-full rounded mb-2"></div>
      <div className="bg-gray-300 h-4 w-full rounded mb-2"></div>
      <div className="bg-gray-300 h-6 w-3/4 rounded mt-6 mb-4"></div>
      <div className="bg-gray-300 h-10 w-full rounded"></div>
    </div>
  );
};
