// client/src/pages/auth/ResetPassword.jsx
import React, { useState } from "react";
import { InputField, SubmitButton } from "../../components/FormComponents";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";

const ResetPassword = () => {
  // Token will come from email link → e.g., /reset-password/:token
  const { token } = useParams();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    // 🔥 Later: call backend API with token
    setTimeout(() => {
      setLoading(false);
      alert("Password has been reset successfully!");
    }, 1500);
  };

  return (
    // Set a dark, full-screen container background
    <div className="flex h-screen bg-gray-900">
      {/* Left Section - Enhanced with vibrant gradient and theme */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-800 to-sky-700 text-white flex-col justify-center items-center p-10 shadow-2xl">
        <motion.h1
          className="text-5xl font-extrabold mb-4 text-center tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Password Secured
        </motion.h1>
        <p className="text-xl text-center font-light leading-relaxed text-gray-200 mt-4">
          Create a strong, unique new password to secure your decentralized voting account.
        </p>
        <div className="mt-8 text-white/70 text-6xl">
            {/* Illustrative icon for security/success */}
            <i className="fas fa-key"></i> 
        </div>
      </div>

      {/* Right Section - Form Area with Dark Background */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-900">
        <form
          onSubmit={handleSubmit}
          // The form container is a dark card with soft glow
          className="w-full max-w-md bg-gray-800 shadow-xl shadow-sky-900/50 rounded-xl p-10 space-y-5 border border-gray-700"
        >
          {/* Form Title */}
          <h2 className="text-3xl font-extrabold text-white text-center mb-6 border-b border-gray-700/50 pb-3">
            Set New Password
          </h2>

          <p className="text-sm text-gray-400 mb-4">
            Enter and confirm your new password below. Token: <span className="text-sky-500 font-mono text-xs">{token ? token.substring(0, 8) + '...' : 'N/A'}</span>
          </p>

          {/* Form Fields - using the enhanced InputField component (assumed styling) */}
          <InputField
            label="New Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <InputField
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          {/* Submit Button - Styling inherited from SubmitButton component */}
          <div className="pt-2">
            <SubmitButton text="Update Password" loading={loading} />
          </div>
          
          {/* Login Link */}
          <p className="text-sm text-gray-400 pt-4 text-center">
            <Link 
              to="/login" 
              className="text-sky-500 hover:text-sky-400 font-bold transition duration-150"
            >
              Go to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;