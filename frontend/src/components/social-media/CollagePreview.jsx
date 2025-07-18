import React from 'react';

const CollagePreview = ({ type, imagesCount }) => {
  if (type === 'side-by-side') {
    if (imagesCount === 3) {
      // 3 vertical rectangles
      return (
        <svg width="40" height="40" viewBox="0 0 40 40">
          <rect x="2" y="2" width="11" height="36" rx="3" fill="#fff" stroke="#9B177E" strokeDasharray="3,2" strokeWidth="2"/>
          <rect x="15" y="2" width="11" height="36" rx="3" fill="#fff" stroke="#9B177E" strokeDasharray="3,2" strokeWidth="2"/>
          <rect x="28" y="2" width="11" height="36" rx="3" fill="#fff" stroke="#9B177E" strokeDasharray="3,2" strokeWidth="2"/>
        </svg>
      );
    }
    // 2 vertical rectangles
    return (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <rect x="2" y="2" width="17" height="36" rx="3" fill="#fff" stroke="#9B177E" strokeDasharray="3,2" strokeWidth="2"/>
        <rect x="21" y="2" width="17" height="36" rx="3" fill="#fff" stroke="#9B177E" strokeDasharray="3,2" strokeWidth="2"/>
      </svg>
    );
  }
  if (type === 'vertical') {
    if (imagesCount === 3) {
      // 3 horizontal rectangles
      return (
        <svg width="40" height="40" viewBox="0 0 40 40">
          <rect x="2" y="2" width="36" height="11" rx="3" fill="#fff" stroke="#9B177E" strokeDasharray="3,2" strokeWidth="2"/>
          <rect x="2" y="15" width="36" height="11" rx="3" fill="#fff" stroke="#9B177E" strokeDasharray="3,2" strokeWidth="2"/>
          <rect x="2" y="28" width="36" height="11" rx="3" fill="#fff" stroke="#9B177E" strokeDasharray="3,2" strokeWidth="2"/>
        </svg>
      );
    }
    // 2 horizontal rectangles
    return (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <rect x="2" y="2" width="36" height="17" rx="3" fill="#fff" stroke="#9B177E" strokeDasharray="3,2" strokeWidth="2"/>
        <rect x="2" y="21" width="36" height="17" rx="3" fill="#fff" stroke="#9B177E" strokeDasharray="3,2" strokeWidth="2"/>
      </svg>
    );
  }
  // grid (only for 3 images)
  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <rect x="2" y="2" width="17" height="17" rx="3" fill="#fff" stroke="#9B177E" strokeDasharray="3,2" strokeWidth="2"/>
      <rect x="21" y="2" width="17" height="17" rx="3" fill="#fff" stroke="#9B177E" strokeDasharray="3,2" strokeWidth="2"/>
      <rect x="2" y="21" width="36" height="15" rx="3" fill="#fff" stroke="#9B177E" strokeDasharray="3,2" strokeWidth="2"/>
    </svg>
  );
};

export default CollagePreview; 