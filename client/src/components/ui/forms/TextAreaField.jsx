import React from 'react';

const TextAreaField = ({ 
  label, 
  name,
  value, 
  onChange, 
  placeholder, 
  error, 
  required = false,
  rows = 4,
  className = '',
  disabled = false,
  maxLength,
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {/* Label: Sky blue for clear distinction */}
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-sky-400">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        className={`
          px-4 py-3 rounded-xl bg-gray-700 text-gray-100 text-sm w-full
          focus:outline-none focus:ring-2 focus:ring-sky-500 
          border ${error ? 'border-red-500' : 'border-gray-600 hover:border-sky-500 transition duration-150'}
          placeholder-gray-400 shadow-inner shadow-black/20 resize-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        {...props}
      />
      
      {/* Character count if maxLength is provided */}
      {maxLength && (
        <div className="text-xs text-gray-400 text-right">
          {value?.length || 0} / {maxLength}
        </div>
      )}
      
      {/* Error: Red highlight */}
      {error && <span className="text-xs text-red-400 font-medium mt-1">{error}</span>}
    </div>
  );
};

export default TextAreaField;
