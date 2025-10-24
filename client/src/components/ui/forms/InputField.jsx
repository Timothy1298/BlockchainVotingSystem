import React, { useState } from 'react';

// Icon components for password toggle
const EyeIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0112 20c-5 0-9.27-3.11-11-7 1.02-2.08 2.5-3.94 4.28-5.32" />
    <path d="M1 1l22 22" />
    <path d="M7.07 7.07L12 12m0 0l4.93 4.93" />
  </svg>
);

const InputField = ({ 
  label, 
  name,
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  error, 
  required = false,
  className = '',
  disabled = false,
  autoComplete,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

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
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            w-full px-4 py-3 rounded-xl bg-gray-700 text-gray-100 text-sm 
            focus:outline-none focus:ring-2 focus:ring-sky-500 
            border ${error ? 'border-red-500' : 'border-gray-600 hover:border-sky-500 transition duration-150'}
            placeholder-gray-400 shadow-inner shadow-black/20
            ${isPassword ? 'pr-12' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          {...props}
        />

        {/* Password Toggle Button */}
        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-sky-400 transition"
          >
            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Error: Red highlight */}
      {error && <span className="text-xs text-red-400 font-medium mt-1">{error}</span>}
    </div>
  );
};

export default InputField;
