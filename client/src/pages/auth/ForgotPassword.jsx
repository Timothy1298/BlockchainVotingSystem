// client/src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { InputField, SubmitButton } from "../../components/FormComponents";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // 🔥 Later: Call backend API
    setTimeout(() => {
      setLoading(false);
      alert("Password reset link sent to your email!");
    }, 1500);
  };

  return (
    // Set a dark, full-screen container background
    <div className="flex h-screen bg-gray-900">
      {/* Left Section - Enhanced with vibrant gradient and blockchain theme */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-800 to-sky-700 text-white flex-col justify-center items-center p-10 shadow-2xl">
        <motion.h1
          className="text-5xl font-extrabold mb-4 text-center tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Reset Your Password
        </motion.h1>
        <p className="text-xl text-center font-light leading-relaxed text-gray-200 mt-4">
          Enter your email address and we’ll send you a link to securely reset your password.
        </p>
        <div className="mt-8 text-white/70 text-6xl">
            {/* Illustrative icon for security/reset */}
            <i className="fas fa-lock"></i> 
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
            Password Recovery
          </h2>

          <p className="text-sm text-gray-400 mb-4">
            We will send a password reset link to the email address associated with your account.
          </p>

          {/* Form Field - using the enhanced InputField component (assumed styling) */}
          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Submit Button - Styling inherited from SubmitButton component */}
          <div className="pt-2">
            <SubmitButton text="Send Reset Link" loading={loading} />
          </div>
          
          {/* Login Link */}
          <p className="text-sm text-gray-400 pt-4 text-center">
            Remembered your password?{" "}
            <Link 
              to="/login" 
              className="text-sky-500 hover:text-sky-400 font-bold transition duration-150"
            >
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;