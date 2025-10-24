import React from 'react';
import { motion } from 'framer-motion';

// Base skeleton component
const SkeletonBase = ({ className = '', animate = true, ...props }) => {
  const baseClasses = 'bg-gray-700 rounded';
  
  if (animate) {
    return (
      <motion.div
        className={`${baseClasses} ${className}`}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        {...props}
      />
    );
  }
  
  return <div className={`${baseClasses} ${className}`} {...props} />;
};

// Candidate card skeleton
export const CandidateCardSkeleton = () => (
  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
    <div className="flex items-start gap-3 mb-3">
      <SkeletonBase className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <SkeletonBase className="h-5 w-3/4 mb-2" />
        <SkeletonBase className="h-4 w-1/2 mb-1" />
        <SkeletonBase className="h-3 w-1/3" />
      </div>
    </div>

    <div className="space-y-2 mb-4">
      <SkeletonBase className="h-3 w-full" />
      <SkeletonBase className="h-3 w-2/3" />
      <SkeletonBase className="h-3 w-1/2" />
    </div>

    <SkeletonBase className="h-4 w-full mb-3" />

    <div className="space-y-3">
      <SkeletonBase className="h-6 w-20 rounded-full" />
      <SkeletonBase className="h-10 w-full rounded-lg" />
      <div className="flex gap-2">
        <SkeletonBase className="h-8 flex-1 rounded-lg" />
        <SkeletonBase className="h-8 flex-1 rounded-lg" />
      </div>
    </div>
  </div>
);

// Statistics skeleton
export const StatisticsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <SkeletonBase className="w-5 h-5" />
          <SkeletonBase className="h-4 w-20" />
        </div>
        <SkeletonBase className="h-8 w-16" />
      </div>
    ))}
  </div>
);

// Blockchain accounts skeleton
export const BlockchainAccountsSkeleton = () => (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
    <div className="flex items-center gap-2 mb-4">
      <SkeletonBase className="w-5 h-5" />
      <SkeletonBase className="h-6 w-40" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <SkeletonBase className="h-4 w-24" />
            <SkeletonBase className="h-3 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonBase className="flex-1 h-6" />
            <SkeletonBase className="w-6 h-6" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Filter controls skeleton
export const FilterControlsSkeleton = () => (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 space-y-4">
        <SkeletonBase className="h-10 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBase key={index} className="h-10 w-full" />
          ))}
        </div>
        <div className="flex gap-2">
          <SkeletonBase className="h-10 w-32" />
          <SkeletonBase className="h-10 w-32" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBase key={index} className="h-10 w-32" />
        ))}
      </div>
    </div>
  </div>
);

// Modal skeleton
export const ModalSkeleton = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <SkeletonBase className="w-5 h-5" />
        <SkeletonBase className="h-6 w-40" />
      </div>
      
      <div className="space-y-4">
        <SkeletonBase className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBase key={index} className="h-10 w-full" />
          ))}
        </div>
        <SkeletonBase className="h-20 w-full" />
        <SkeletonBase className="h-24 w-full" />
      </div>
      
      <div className="flex gap-3 mt-6">
        <SkeletonBase className="h-10 flex-1" />
        <SkeletonBase className="h-10 flex-1" />
      </div>
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
    <div className="p-4 border-b border-gray-700">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonBase key={index} className="h-4 w-20" />
        ))}
      </div>
    </div>
    <div className="divide-y divide-gray-700">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonBase key={colIndex} className="h-4 w-16" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Generic skeleton for any content
export const ContentSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonBase 
        key={index} 
        className={`h-4 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`} 
      />
    ))}
  </div>
);

// Loading overlay
export const LoadingOverlay = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3">
        <motion.div
          className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="text-white">{message}</span>
      </div>
    </div>
  </div>
);

export default SkeletonBase;
