import React from 'react';

interface LoadingOverlayProps {
  message: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-amber-300">
      <svg className="animate-spin h-12 w-12 mb-6" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h1 className="text-2xl font-mono-tech mb-2">Activating The Aletheia Engine...</h1>
      <p className="text-lg text-violet-400 opacity-80">{message}</p>
    </div>
  );
};