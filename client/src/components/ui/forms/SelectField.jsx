import React from 'react';

const SelectField = ({ 
  label, 
  name,
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select an option',
  error, 
  required = false,
  className = '',
  disabled = false,
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
      
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            px-4 py-3 rounded-xl bg-gray-700 text-gray-100 text-sm w-full
            focus:outline-none focus:ring-2 focus:ring-sky-500 
            border ${error ? 'border-red-500' : 'border-gray-600 hover:border-sky-500 transition duration-150'}
            shadow-inner appearance-none pr-10
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          {...props}
        >
          <option value="" disabled className="text-gray-500 bg-gray-700">
            {placeholder}
          </option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value} className="text-gray-100 bg-gray-700">
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Custom Chevron icon for select dropdown */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Error: Red highlight */}
      {error && <span className="text-xs text-red-400 font-medium mt-1">{error}</span>}
    </div>
  );
};

export default SelectField;
