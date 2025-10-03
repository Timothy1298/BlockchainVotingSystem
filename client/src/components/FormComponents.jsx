// FormComponents.jsx
// =====================================
// Reusable form components:
// - InputField: text/email/number inputs with label + error
// - SelectField: dropdown menu
// - TextAreaField: multiline text input
// - SubmitButton: styled button with animation
// - FormCard: wrapper card for forms
// =====================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Icon utility for clarity (simulating Lucide icons)
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


// Input Field
export const InputField = ({ label, name, type = 'text', value, onChange, placeholder, error, className = '' }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {/* Label: Sky blue for clear distinction */}
      {label && <label htmlFor={name} className="text-sm font-medium text-sky-400">{label}</label>}

      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 rounded-xl bg-gray-700 text-gray-100 text-sm 
            focus:outline-none focus:ring-2 focus:ring-sky-500 
            border ${error ? 'border-red-500' : 'border-gray-600 hover:border-sky-500 transition duration-150'}
            placeholder-gray-400 shadow-inner shadow-black/20
            ${isPassword ? 'pr-12' : ''}
          `}
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

// Select Field
export const SelectField = ({ label, name, options = [], value, onChange, error, className = '' }) => (
  <div className={`flex flex-col gap-1 w-full ${className}`}>
    {label && <label htmlFor={name} className="text-sm font-medium text-sky-400">{label}</label>}
    <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`
            px-4 py-3 rounded-xl bg-gray-700 text-gray-100 text-sm w-full
            focus:outline-none focus:ring-2 focus:ring-sky-500 
            border ${error ? 'border-red-500' : 'border-gray-600 hover:border-sky-500 transition duration-150'}
            shadow-inner appearance-none pr-10
          `}
        >
          <option value="" disabled className="text-gray-500 bg-gray-700">
            Select...
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
    {error && <span className="text-xs text-red-400 font-medium mt-1">{error}</span>}
  </div>
);

// Text Area
export const TextAreaField = ({ label, name, value, onChange, placeholder, error, className = '' }) => (
  <div className={`flex flex-col gap-1 w-full ${className}`}>
    {label && <label htmlFor={name} className="text-sm font-medium text-sky-400">{label}</label>}
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      className={`
        px-4 py-3 rounded-xl bg-gray-700 text-gray-100 text-sm w-full
        focus:outline-none focus:ring-2 focus:ring-sky-500 
        border ${error ? 'border-red-500' : 'border-gray-600 hover:border-sky-500 transition duration-150'}
        placeholder-gray-400 shadow-inner shadow-black/20 resize-none
      `}
    />
    {error && <span className="text-xs text-red-400 font-medium mt-1">{error}</span>}
  </div>
);

// Submit Button
export const SubmitButton = ({ text, onClick, disabled, loading, className = '' }) => (
  <motion.button
    whileHover={{ scale: disabled || loading ? 1 : 1.02 }} 
    whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
    disabled={disabled || loading}
    onClick={onClick}
    className={`
      px-6 py-3 mt-4 rounded-xl font-bold transition-all duration-200 ease-in-out uppercase tracking-wider w-full text-white
      ${className}
      ${
        disabled || loading
          ? 'bg-gray-600 cursor-not-allowed text-gray-300 shadow-md'
          : 'bg-sky-500 hover:bg-sky-400 shadow-lg hover:shadow-xl shadow-sky-500/50' 
      }
    `}
  >
    {/* Loading spinner uses Tailwind classes for spin effect */}
    {loading ? (
        <span className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg> 
            <span>Loading...</span>
        </span>
    ) : text}
  </motion.button>
);

// Form Card Wrapper
export const FormCard = ({ title, children, onSubmit, className = '' }) => (
  <motion.form
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    onSubmit={(e) => {
      e.preventDefault();
      onSubmit?.();
    }}
    // Form Card: Dark, rounded, strong shadow, slight background blur
    className={`bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl shadow-black/70 border border-sky-500/30 w-full max-w-lg ${className}`}
  >
    {/* Title: White, bold, with a sky blue underline */}
    {title && <h2 className="text-3xl font-extrabold text-white mb-6 tracking-wide border-b border-sky-500/50 pb-3">{title}</h2>}
    <div className="flex flex-col gap-6">{children}</div>
  </motion.form>
);
export default { InputField, SelectField, TextAreaField, SubmitButton, FormCard };