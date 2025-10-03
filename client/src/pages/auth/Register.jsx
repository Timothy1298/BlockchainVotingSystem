// client/src/pages/auth/Register.jsx
import React, { useState } from "react";
import { InputField, SelectField, SubmitButton } from "../../components/FormComponents";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Register = () => {
  const { register } = React.useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }
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
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    register(formData.fullName, formData.email, formData.password, formData.role)
      .then(() => {
        setLoading(false);
        setMessage({ type: 'success', text: 'Registered successfully — redirecting to login...' });
        setTimeout(() => navigate('/login'), 900);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
        const msg = err?.response?.data?.message || (err?.response?.data?.errors && err.response.data.errors.map(e=>e.msg).join(', ')) || 'Registration failed';
        setMessage({ type: 'error', text: msg });
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

          {/* Submit Button - Styling inherited from SubmitButton component */}
          {/* Increased margin for better separation */}
          <div className="pt-4">
            <SubmitButton text="Register" loading={loading} />
          </div>
          
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