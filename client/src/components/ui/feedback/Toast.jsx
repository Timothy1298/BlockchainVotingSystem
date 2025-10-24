import React, { memo } from "react";

const Toast = memo(({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
      {message}
    </div>
  );
});

Toast.displayName = 'Toast';

export default Toast;
