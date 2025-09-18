import React from "react";

const LoadingOverlay: React.FC<{ message?: string }> = ({ message = "Processing..." }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-4"></div>
        <p className="text-lg font-semibold">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
