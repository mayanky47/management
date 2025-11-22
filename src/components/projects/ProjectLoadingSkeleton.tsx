import React from 'react';

const ProjectLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Back Button Skeleton */}
        <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />

        {/* Card Skeleton */}
        <div className="bg-white rounded-2xl shadow p-8 space-y-4">
          <div className="w-1/3 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Action Bar Skeleton */}
        <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />

        {/* Content Skeleton */}
        <div className="h-64 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse" />
      </div>
    </div>
  );
};

export default ProjectLoadingSkeleton;