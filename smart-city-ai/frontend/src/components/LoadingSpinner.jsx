import React from 'react';

const LoadingSpinner = ({ message = "Loading surveillance logs..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 rounded-full border-4 border-dark-800"></span>
        <span className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></span>
      </div>
      {message && (
        <p className="text-xs text-dark-400 font-semibold tracking-wider uppercase animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
