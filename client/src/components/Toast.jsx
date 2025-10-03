import React from 'react';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 bg-black/70 text-white px-4 py-2 rounded shadow-lg">
      {message}
    </div>
  );
}
