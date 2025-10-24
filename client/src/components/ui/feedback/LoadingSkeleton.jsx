import React from 'react';
import { motion } from 'framer-motion';

const SkeletonBox = ({ className = '', animate = true }) => (
  <motion.div
    className={`bg-gray-700 rounded ${className}`}
    animate={animate ? {
      opacity: [0.5, 1, 0.5],
    } : {}}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

export const ElectionCardSkeleton = () => (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
    <div className="space-y-4">
      <SkeletonBox className="h-6 w-3/4" />
      <SkeletonBox className="h-4 w-1/2" />
      <div className="space-y-2">
        <SkeletonBox className="h-3 w-full" />
        <SkeletonBox className="h-3 w-2/3" />
      </div>
      <div className="flex space-x-2">
        <SkeletonBox className="h-8 w-20" />
        <SkeletonBox className="h-8 w-16" />
      </div>
    </div>
  </div>
);

export const CandidateCardSkeleton = () => (
  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
    <div className="flex items-center space-x-4">
      <SkeletonBox className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-5 w-1/3" />
        <SkeletonBox className="h-4 w-1/4" />
      </div>
      <SkeletonBox className="h-8 w-20" />
    </div>
  </div>
);

export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="space-y-3">
          <SkeletonBox className="h-4 w-1/2" />
          <SkeletonBox className="h-8 w-1/3" />
          <SkeletonBox className="h-3 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
    <div className="p-4 border-b border-gray-700">
      <SkeletonBox className="h-6 w-1/4" />
    </div>
    <div className="divide-y divide-gray-700">
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="flex space-x-4">
            {[...Array(columns)].map((_, colIndex) => (
              <SkeletonBox key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default {
  ElectionCardSkeleton,
  CandidateCardSkeleton,
  DashboardStatsSkeleton,
  TableSkeleton,
  SkeletonBox
};
