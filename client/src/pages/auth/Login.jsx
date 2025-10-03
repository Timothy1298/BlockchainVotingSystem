// client/src/pages/auth/Login.jsx
import React, { useState } from "react";
import { InputField, SubmitButton } from "../../components/FormComponents";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const { login } = React.useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    login(formData.email, formData.password)
      .then(() => {
        setLoading(false);
        setMessage({ type: 'success', text: 'Login successful — redirecting...' });
        setTimeout(() => navigate('/dashboard'), 1000);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
        const msg = err?.response?.data?.message || (err?.response?.data?.errors && err.response.data.errors.map(e=>e.msg).join(', ')) || 'Login failed';
        setMessage({ type: 'error', text: msg });
      });
  };

  return (
    // Set a dark, full-screen container background
    <div className="flex h-screen bg-gray-900">
      {/* Left Section - Enhanced with more vibrant gradient and depth */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-800 to-sky-700 text-white flex-col justify-center items-center p-10 shadow-2xl">
        <motion.h1
          className="text-6xl font-extrabold mb-6 tracking-tight" // Larger, bolder text
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome Back
        </motion.h1>
        <p className="text-xl text-center font-light leading-relaxed text-gray-200">
          Login to continue voting securely on the **decentralized blockchain network**.
        </p>
        <div className="mt-8">
            {/* Illustrative element for the blockchain theme */}
            <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-t-sky-400 border-r-transparent border-white rounded-full"
            ></motion.div>
        </div>
      </div>

      {/* Right Section - Form Area with Dark Background */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-900">
        <form
          onSubmit={handleSubmit}
          // The form container is now a dark card with a soft glow
          className="w-full max-w-md bg-gray-800 shadow-xl shadow-sky-900/50 rounded-xl p-10 space-y-5 border border-gray-700"
        >
          {/* Form Title */}
          <h2 className="text-3xl font-extrabold text-white text-center mb-8 border-b border-gray-700/50 pb-3">
            Secure Login
          </h2>

          {/* Form Fields - InputField's internal styling from previous component is assumed */}
          <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
          <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />

          {/* Remember Me and Forgot Password Section */}
          <div className="flex justify-between items-center pt-2">
            <label className="flex items-center text-sm text-gray-400 font-medium cursor-pointer">
              {/* Styled Checkbox */}
              <input type="checkbox" className="mr-2 h-4 w-4 rounded bg-gray-700 border-gray-600 text-sky-500 focus:ring-sky-500" /> 
              Remember Me
            </label>
            <Link 
              to="/forgot-password" 
              className="text-sky-500 hover:text-sky-400 hover:underline text-sm font-medium transition duration-150"
            >
              Forgot Password?
            </Link>
          </div>
          
          {/* Submit Button - Styling inherited from SubmitButton component */}
          <SubmitButton text="Login to Dashboard" loading={loading} />
          
          {/* Register Link */}
          <p className="text-sm text-gray-400 mt-6 text-center">
            Don’t have an account?{" "}
            <Link 
              to="/register" 
              className="text-sky-500 hover:text-sky-400 font-bold transition duration-150"
            >
              Register Now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;