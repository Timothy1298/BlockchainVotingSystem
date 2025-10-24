import React from 'react';
import { motion } from 'framer-motion';

const RadioField = ({ 
  label, 
  name,
  value, 
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
            id={`${name}-${value}`}
            name={name}
            type="radio"
            value={value}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={`
              w-5 h-5 text-sky-500 bg-gray-700 border-2 border-gray-600 rounded-full
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
              <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
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

export default RadioField;
