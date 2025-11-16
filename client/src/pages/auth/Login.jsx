// client/src/pages/auth/Login.jsx
import React, { useState, useContext } from "react";
import { InputField, SubmitButton } from "../../components/ui/forms";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../../contexts/auth';
import { useGlobalUI } from '../../components/common';

const Login = () => {
  const { login } = useContext(AuthContext);
  const { showToast } = useGlobalUI();
  // If redirected here after a 401, show a clear message
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem('auth_message');
      if (raw) {
        const msg = JSON.parse(raw);
        if (msg && msg.text) {
          showToast(msg.text, 'error');
          setMessage({ type: 'error', text: msg.text });
        }
        sessionStorage.removeItem('auth_message');
      } else {
        // Also read query param unauth=1 and show a generic message
        const params = new URLSearchParams(window.location.search);
        if (params.get('unauth')) {
          const text = 'You were signed out. Please login again.';
          showToast(text, 'error');
          setMessage({ type: 'error', text });
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);
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
      .then((res) => {
        setLoading(false);
        setMessage({
          type: "success",
          text: "Login successful — redirecting...",
        });
        setTimeout(() => setMessage(null), 40000); // message lasts 40s
        const role = res?.user?.role || res?.data?.user?.role || res?.data?.role || res?.role;
        const normalized = role ? String(role).toLowerCase() : '';
        const target = normalized === 'admin' ? '/admin/dashboard' : '/voter/dashboard';
        setTimeout(() => navigate(target), 800);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
        const msg =
          err?.response?.data?.message ||
          (err?.response?.data?.errors &&
            err.response.data.errors.map((e) => e.msg).join(", ")) ||
          "Login failed";
        setMessage({ type: "error", text: msg });
        setTimeout(() => setMessage(null), 40000); // message lasts 40s
      });
  };

  return (
    // Set a dark, full-screen container background
    <div className="flex h-screen bg-gray-900">
      {/* Left Section - Enhanced with more vibrant gradient and depth */}
     
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-900 to-sky-900 text-white flex-col justify-center items-center p-10 shadow-2xl relative overflow-hidden">
        {/* 1. Floating Nodes Background (Enhanced) */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full bg-sky-400/80 shadow-lg`}
            initial={{ opacity: 0 }}
            animate={{
              x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`], // More random movement
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [0, 1, 1, 0], // Fade in and out
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2, // Staggered delay for continuous effect
              repeatType: "reverse",
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* 2. Content (Z-Index 10) */}
        <div className="relative z-10 text-center">
          <motion.h1
            className="text-6xl font-extrabold mb-6 tracking-tight drop-shadow-md text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-white"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Secure Access Portal
          </motion.h1>
          <p className="text-xl text-center font-light leading-relaxed text-gray-200 max-w-sm">
            Login to continue voting securely on the **decentralized blockchain
            network**.
          </p>

          {/* 3. Simulated Block Loader/Status */}
          <div className="mt-10 flex flex-col items-center">
            <motion.div
              className="w-48 h-10 border-2 border-sky-400 p-1 flex justify-start items-center overflow-hidden rounded-md shadow-2xl bg-indigo-900/50"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <motion.div
                className="h-full bg-sky-500 rounded-sm"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop",
                }}
              />
              <span className="absolute text-sm font-mono text-white/70 tracking-widest pl-2">
                BLOCK_VALIDATING...
              </span>
            </motion.div>
            <p className="text-sm text-sky-400 mt-2 font-medium">
              Consensus Secured.
            </p>
          </div>

          {/* 4. Trust-Building Fact/Stat */}
          <div className="mt-8 p-4 bg-gray-700/30 rounded-lg border border-sky-600/50 shadow-inner">
            <p className="text-2xl font-bold text-sky-300">
              <span className="text-indigo-300">4,123,892</span> Votes Processed
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Zero tampering incidents since launch.{" "}
              <span className="font-semibold">Your vote is immutable.</span>
            </p>
          </div>
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
          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Remember Me and Forgot Password Section */}
          <div className="flex justify-between items-center pt-2">
            <label className="flex items-center text-sm text-gray-400 font-medium cursor-pointer">
              {/* Styled Checkbox */}
              <input
                type="checkbox"
                className="mr-2 h-4 w-4 rounded bg-gray-700 border-gray-600 text-sky-500 focus:ring-sky-500"
              />
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

          {/* Error/Success Message */}
          {message && (
            <div
              className={`mt-2 text-center px-4 py-2 rounded ${
                message.type === "error"
                  ? "bg-red-700 text-white"
                  : "bg-green-700 text-white"
              }`}
            >
              {message.text}
            </div>
          )}

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
