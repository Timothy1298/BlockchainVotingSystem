// client/src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { InputField, SubmitButton } from "../../components/ui/forms";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useGlobalUI } from "../../components/common/GlobalUI";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { showToast, showLoader, hideLoader } = useGlobalUI();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }

    setLoading(true);
    showLoader('Generating reset token...');

    try {
      const response = await fetch('/api/voter-auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.data?.resetToken) {
          // For development: show the token directly
          setResetToken(data.data.resetToken);
          showToast('Reset token generated! Use it to reset your password.', 'success');
        } else {
          showToast('If that email exists, a reset link has been sent', 'success');
        }
      } else {
        showToast(data.message || 'Failed to generate reset token', 'error');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    showLoader('Resetting password...');

    try {
      const response = await fetch(`/api/voter-auth/reset-password/${resetToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Password reset successfully! You can now login with your new password.', 'success');
        setResetToken(null);
        setNewPassword("");
        setConfirmPassword("");
        setEmail("");
      } else {
        showToast(data.message || 'Failed to reset password', 'error');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
      hideLoader();
    }
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
        <div className="w-full max-w-md bg-gray-800 shadow-xl shadow-sky-900/50 rounded-xl p-10 space-y-5 border border-gray-700">
          {/* Form Title */}
          <h2 className="text-3xl font-extrabold text-white text-center mb-6 border-b border-gray-700/50 pb-3">
            {resetToken ? 'Reset Password' : 'Password Recovery'}
          </h2>

          {!resetToken ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-gray-400 mb-4">
                Enter your email address to generate a password reset token.
              </p>

              {/* Email Field */}
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Submit Button */}
              <div className="pt-2">
                <SubmitButton text="Generate Reset Token" loading={loading} />
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <p className="text-sm text-gray-400 mb-4">
                Use the generated token to reset your password.
              </p>

              {/* Token Display */}
              <div className="bg-gray-700 p-3 rounded-lg">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reset Token
                </label>
                <div className="text-xs text-gray-400 font-mono break-all">
                  {resetToken}
                </div>
              </div>

              {/* New Password Field */}
              <InputField
                label="New Password"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              {/* Confirm Password Field */}
              <InputField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {/* Submit Button */}
              <div className="pt-2">
                <SubmitButton text="Reset Password" loading={loading} />
              </div>

              {/* Back to Email Button */}
              <button
                type="button"
                onClick={() => setResetToken(null)}
                className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Back to email entry
              </button>
            </form>
          )}
          
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
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;