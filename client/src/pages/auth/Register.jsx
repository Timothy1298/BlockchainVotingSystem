// client/src/pages/auth/Register.jsx
import React, { useState, useContext } from "react";
import { InputField, SelectField, SubmitButton } from "../../components/ui/forms";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../../contexts/auth';
import { useGlobalUI } from '../../components/common';
const Register = () => {
  const { register } = useContext(AuthContext);
  const { showToast } = useGlobalUI();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    adminKey: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Basic client-side validation
    if (formData.password !== formData.confirmPassword) {
      setLoading(false);
      showToast('Passwords do not match', 'error');
      return;
    }

    const roleToSend = formData.role || "voter";
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: roleToSend
    };
    if (roleToSend === "admin") {
      payload.adminKey = formData.adminKey;
    }
    console.log('Register form submit:', payload);
    register(payload)
      .then(() => {
        setLoading(false);
        showToast('Registered successfully — redirecting to login...', 'success');
        setTimeout(() => setMessage(null), 40000); // message lasts 40s
        setTimeout(() => navigate('/login'), 900);
      })
      .catch((err) => {
        setLoading(false);
        console.error('Registration error:', err);
        const msg = err?.response?.data?.message || (err?.response?.data?.errors && err.response.data.errors.map(e=>e.msg).join(', ')) || 'Registration failed';
        showToast(msg, 'error');
        setTimeout(() => setMessage(null), 40000); // message lasts 40s
      });
  };

  return (
    // Set a dark, full-screen container background
    <div className="flex h-screen bg-gray-900">
      {/* Left Section - Enhanced with more vibrant gradient and depth */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-800 to-sky-700 text-white flex-col justify-center items-center p-10 shadow-2xl">
        <motion.h1
          className="text-5xl font-extrabold mb-4 text-center tracking-tight" // Slightly smaller but still bold
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Blockchain Voting System
        </motion.h1>
        <p className="text-xl text-center font-light leading-relaxed text-gray-200 mt-4">
          Secure, Transparent, and Decentralized voting powered by Blockchain. Join now!
        </p>
        <div className="mt-8 text-white/50 text-7xl">
            {/* Simple iconic element (e.g., a lock or a chain link) */}
            <i className="fas fa-link"></i> 
        </div>
      </div>

      {/* Right Section - Form Area with Dark Background */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-900">
        <form
          onSubmit={handleSubmit}
          // The form container is a dark card with soft glow
          className="w-full max-w-lg bg-gray-800 shadow-xl shadow-sky-900/50 rounded-xl p-10 space-y-4 border border-gray-700"
        >
          {/* Form Title */}
          <h2 className="text-3xl font-extrabold text-white text-center mb-6 border-b border-gray-700/50 pb-3">
            Create Your Account
          </h2>
    
          {/* Form Fields - using the enhanced components (assumed styling) */}
          <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
          <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
          <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
          <InputField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />

          <SelectField label="Role" name="role" value={formData.role} onChange={handleChange}
            options={[{label: "Voter", value:"voter"}, {label: "Admin", value:"admin"}]} />

          {/* Admin Key Field - only show if role is admin */}
          {formData.role === "admin" && (
            <InputField label="Admin Registration Key" name="adminKey" type="password" value={formData.adminKey} onChange={handleChange} />
          )}

          {/* Submit Button - Styling inherited from SubmitButton component */}
          {/* Increased margin for better separation */}
          <div className="pt-4">
            <SubmitButton text="Register" loading={loading} />
          </div>

          {/* Error/Success Message */} // No need for this as we are using showToast
          {/* Login Link */}
          <p className="text-sm text-gray-400 pt-2 text-center">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-sky-500 hover:text-sky-400 font-bold transition duration-150"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;