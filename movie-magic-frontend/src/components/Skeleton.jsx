// src/components/Skeleton.jsx
import React from 'react';

export default function Skeleton({ width = 'w-full', height = 'h-4', className = '' }) {
  return (
    <div
      className={`${width} ${height} bg-gray-300 dark:bg-gray-700 animate-pulse rounded ${className}`}
    />
  );
}