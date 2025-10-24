import React from 'react';
import { motion } from 'framer-motion';

const CheckboxField = ({ 
  label, 
  name,
  checked, 
  onChange, 
  error, 
  required = false,
  className = '',
  disabled = false,
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <motion.label 
        className="flex items-center space-x-3 cursor-pointer group"
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        <div className="relative">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={`
              w-5 h-5 text-sky-500 bg-gray-700 border-2 border-gray-600 rounded-md 
              focus:ring-2 focus:ring-sky-500 focus:ring-offset-0
              transition-all duration-200
              ${error ? 'border-red-500' : 'group-hover:border-sky-400'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            {...props}
          />
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
          )}
        </div>
        <span className="text-sm font-medium text-gray-300 group-hover:text-sky-300 transition-colors">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </span>
      </motion.label>
      
      {/* Error: Red highlight */}
      {error && <span className="text-xs text-red-400 font-medium mt-1">{error}</span>}
    </div>
  );
};

export default CheckboxField;
