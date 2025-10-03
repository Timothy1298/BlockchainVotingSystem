// Modal.jsx
// =====================================
// Reusable Modal component with backdrop
// Includes:
// - Title, content, and actions
// - Animated open/close with Framer Motion
// - Flexible usage: confirmations, info dialogs, etc.
// =====================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, title, children, onClose, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Backdrop: Darker, strong blur, highest z-index
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200]"
          onClick={onClose} // Allows clicking outside to close
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            // Modal Card: Dark, rounded, shadow, subtle theme border
            className="bg-gray-800 rounded-3xl shadow-2xl shadow-black/80 border border-sky-500/30 w-[90%] max-w-md p-8 text-left"
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {title && (
                // Title: Prominent and accented
                <h2 id="modal-title" className="text-2xl font-extrabold text-white mb-4 border-b border-gray-700 pb-3">
                    {title}
                </h2>
            )}

            {/* Content Area */}
            <div className="text-gray-300 text-base mb-8">{children}</div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
                {/* Cancel/Close Button: Soft, clear secondary action */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-5 py-3 rounded-xl bg-gray-700 text-gray-300 font-semibold hover:bg-gray-600 transition shadow-md"
                >
                    {cancelText}
                </motion.button>
                
                {onConfirm && (
                    // Confirm Button: High contrast, theme primary color (Sky Blue)
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onConfirm}
                        className="px-5 py-3 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-500 transition shadow-lg shadow-sky-900/50"
                    >
                        {confirmText}
                    </motion.button>
                )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;