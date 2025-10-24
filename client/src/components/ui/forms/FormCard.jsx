import React from 'react';
import { motion } from 'framer-motion';

const FormCard = ({ 
  title, 
  children, 
  onSubmit, 
  className = '',
  maxWidth = 'max-w-lg',
  ...props 
}) => {
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
      // Form Card: Dark, rounded, strong shadow, slight background blur
      className={`bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl shadow-black/70 border border-sky-500/30 w-full ${maxWidth} ${className}`}
      {...props}
    >
      {/* Title: White, bold, with a sky blue underline */}
      {title && (
        <h2 className="text-3xl font-extrabold text-white mb-6 tracking-wide border-b border-sky-500/50 pb-3">
          {title}
        </h2>
      )}
      <div className="flex flex-col gap-6">{children}</div>
    </motion.form>
  );
};

export default FormCard;

