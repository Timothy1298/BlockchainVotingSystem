// Layout.jsx
// =====================================
// Contains Sidebar (fixed) + Topbar components for dashboard
// Sidebar: Always visible, left side
// Topbar: Top navigation with page title, search, notifications, user profile
// =====================================

import React, { useState, Fragment, useContext } from 'react';
import { Topbar } from '../components/ui/layout';
import { HelpGuide } from '../components/common';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, BarChart2, Settings, Shield, X, Bell, User, FileText, Activity, Database } from 'lucide-react';
import { AuthContext } from '../contexts/auth';


// Sidebar
// Sidebar

const Sidebar = ({ user, mobileOpen, onClose }) => {
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Home, to: isAdmin ? "/admin/dashboard" : "/voter/dashboard" },
    {id: "elections", label: "Elections", icon: Home, to: isAdmin ? "/admin/elections" : "/voter/dashboard"}, 
    { id: "candidates", label: "Candidates", icon: Users, to: isAdmin ? "/admin/candidates" : "/voter/dashboard" },
    { id: "results", label: "Results", icon: BarChart2, to: isAdmin ? "/admin/results" : "/voter/dashboard" },
    { id: "profile", label: "Profile", icon: User, to: isAdmin ? "/admin/profile" : "/voter/profile" },
    ...(isAdmin ? [
      { id: "settings", label: "Admin Settings", icon: Settings, to: "/admin/settings" },
      { id: "voters", label: "Voters/Verify", icon: Shield, to: "/admin/voters" },
      { id: "system-logs", label: "System Logs", icon: FileText, to: "/admin/system-logs" },
      { id: "blockchain-health", label: "Blockchain Health", icon: Activity, to: "/admin/blockchain-health" },
      { id: "analytics", label: "Analytics & Reports", icon: BarChart2, to: "/admin/analytics" },
      { id: "notifications", label: "Notifications", icon: Bell, to: "/admin/notifications" },
      { id: "user-details", label: "User Details", icon: Database, to: "/admin/user-details" }
    ] : [])
  ];
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
      isActive
        ? "bg-sky-600 text-white shadow-lg shadow-sky-900/50"
        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
    }`;
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-gray-900/95 border-r border-gray-800 flex-col p-6 z-50 shadow-2xl">
        <h1 className="text-2xl font-extrabold text-sky-400 mb-12 tracking-wider">BLOCK VOTE</h1>
        <nav className="flex flex-col gap-2">
          {tabs.map(({ id, label, icon: Icon, to }) => (
            <NavLink 
              key={id} 
              to={to} 
              className={linkClass} 
              end={id === 'dashboard'}
            >
              <Icon className="w-5 h-5" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <Fragment>
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 w-64 bg-gray-900/95 border-r border-gray-800 flex flex-col p-6 z-50 md:hidden shadow-2xl"
            >
              <div className="flex justify-between mb-6">
                <h1 className="text-xl font-bold text-sky-400 tracking-wider">BLOCK VOTE</h1>
                <button onClick={onClose}>
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {tabs.map(({ id, label, icon: Icon, to }) => (
                  <NavLink 
                    key={id} 
                    to={to} 
                    onClick={onClose} 
                    className={linkClass} 
                    end={id === 'dashboard'}
                  >
                    <Icon className="w-5 h-5" /> {label}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/70 z-40 md:hidden"
            />
          </Fragment>
        )}
      </AnimatePresence>
    </>
  );
};
// Layout wrapper (Sidebar + Topbar + Content)
export const DashboardLayout = ({
  children,
  activeTab,
  onTabChange,
  title,
  onSearch,
  user,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Note: Using the provided props as fallback in case context is not fully mocked/implemented
  const auth = useContext(AuthContext);
  const loggedUser = auth?.user || user;
  const logoutFn = auth?.logout || onLogout;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white flex">
      <Sidebar
        user={loggedUser}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <Topbar
          title={title}
          onSearch={onSearch}
          onHamburgerClick={() => setMobileOpen(true)}
          user={loggedUser}
          onLogout={logoutFn}
        />
        <main className="pt-20 px-4 md:px-8 pb-10 min-h-[calc(100vh-80px)] w-full max-w-7xl mx-auto">
          {children}
        </main>
        <HelpGuide />
        <footer className="bg-gray-900 border-t border-gray-800 px-6 py-8 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-2xl font-extrabold text-sky-400 tracking-wider mb-1">BLOCK VOTE</span>
              <span className="text-xs text-gray-400">© {new Date().getFullYear()} Blockchain Voting System. All rights reserved.</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-4 text-sm">
                <a href="/dashboard" className="hover:text-sky-400 transition">Dashboard</a>
                <a href="/candidates" className="hover:text-sky-400 transition">Candidates</a>
                <a href="/results" className="hover:text-sky-400 transition">Results</a>
                <a href="/profile" className="hover:text-sky-400 transition">Profile</a>
              </div>
              <div className="flex gap-4 mt-2">
                <a href="mailto:support@blockvote.com" className="text-gray-400 hover:text-sky-400 transition flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm0 0v4a4 4 0 01-8 0v-4"/></svg>
                  support@blockvote.com
                </a>
                <a href="https://github.com/blockvote" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-400 transition flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.417-.012 2.747 0 .267.18.577.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/></svg>
                  GitHub
                </a>
                <a href="https://twitter.com/blockvote" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-400 transition flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.09 9.09 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.7 1.64 1.15c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.94 3.65A4.48 4.48 0 01.96 6v.06c0 2.13 1.52 3.91 3.54 4.31-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.55 1.72 2.16 2.97 4.07 3A9.05 9.05 0 010 19.54a12.8 12.8 0 006.95 2.04c8.34 0 12.9-6.91 12.9-12.9 0-.2 0-.39-.01-.58A9.22 9.22 0 0023 3z"/></svg>
                  Twitter
                </a>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <span className="text-sm text-gray-400">Empowering secure, transparent, and fair elections with blockchain technology.</span>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-gray-500">Made with <span className="text-red-500">♥</span> for democracy</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};