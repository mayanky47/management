import React from "react";

const ProjectLoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <div className="h-6 w-24 bg-gray-200 rounded mb-6"></div>

      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow p-6 md:p-8 space-y-4">
          <div className="h-10 w-3/4 bg-gray-200 rounded"></div>
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow">
          <div className="border-b border-gray-200 px-6 md:px-8">
            <div className="flex gap-6 -mb-px">
              <div className="h-12 w-28 bg-gray-200 border-b-2 border-purple-600"></div>
              <div className="h-12 w-24 bg-gray-100"></div>
              <div className="h-12 w-32 bg-gray-100"></div>
            </div>
          </div>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProjectLoadingSkeleton;
