import React from 'react';
import { motion } from 'framer-motion';

const SubmitButton = ({ 
  text,
  children, 
  loading = false, 
  disabled = false,
  variant = 'primary',
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'px-6 py-3 mt-4 rounded-xl font-bold transition-all duration-200 ease-in-out uppercase tracking-wider w-full text-white';
  
  const variantClasses = {
    primary: 'bg-sky-500 hover:bg-sky-400 shadow-lg hover:shadow-xl shadow-sky-500/50',
    secondary: 'bg-gray-600 hover:bg-gray-500 shadow-lg hover:shadow-xl shadow-gray-600/50',
    danger: 'bg-red-500 hover:bg-red-400 shadow-lg hover:shadow-xl shadow-red-500/50',
    success: 'bg-green-500 hover:bg-green-400 shadow-lg hover:shadow-xl shadow-green-500/50',
    warning: 'bg-yellow-500 hover:bg-yellow-400 shadow-lg hover:shadow-xl shadow-yellow-500/50'
  };

  const disabledClasses = 'bg-gray-600 cursor-not-allowed text-gray-300 shadow-md';

  return (
    <motion.button
      type="submit"
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }} 
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${disabled || loading ? disabledClasses : variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center space-x-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> 
          <span>Loading...</span>
        </span>
      ) : (
        text || children
      )}
    </motion.button>
  );
};

export default SubmitButton;
