
// Topbar

import { useEffect, useState } from 'react';
import { Menu, Bell, LogOut, Search, Zap } from 'lucide-react';
import { initWeb3 } from '../services/web3';
import { AuthContext } from '../context/AuthContext';



const Topbar = ({ user, onLogout, onSearch, onHamburgerClick }) => {
  const [wallet, setWallet] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("connected_wallet");
    if (stored) setWallet(stored);
  }, []);

  const connect = async () => {
    try {
      const { provider, signer } = await initWeb3({ requestAccounts: true });
      if (!provider || !signer) throw new Error("Wallet not available");
      const addr = await signer.getAddress();
      setWallet(addr);
      localStorage.setItem("connected_wallet", addr);
    } catch (e) {
      setErr(e.message);
    }
  };

  const disconnect = () => {
    setWallet(null);
    localStorage.removeItem("connected_wallet");
  };

  return (
    <header className="fixed left-0 md:left-64 top-0 right-0 h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 z-40">
      <div className="flex items-center gap-3">
        <button className="md:hidden text-sky-400" onClick={onHamburgerClick}>
          <Menu className="w-6 h-6" />
        </button>
        
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="px-4 pl-10 py-2 rounded-xl bg-gray-700 text-sm text-gray-100 focus:ring-2 focus:ring-sky-500 border border-gray-700"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Wallet */}
        {wallet ? (
          <div onClick={disconnect} className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 rounded-xl text-sm font-mono cursor-pointer">
            <Zap className="inline w-4 h-4" /> {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </div>
        ) : (
          <button onClick={connect} className="px-4 py-1.5 bg-sky-600 rounded-xl text-white text-sm font-semibold">
            Connect Wallet
          </button>
        )}

        {/* User */}
        <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
          <span className="font-semibold text-gray-300">{user?.fullName || "Guest"}</span>
          <span className="bg-sky-600 text-white text-xs px-3 py-1 rounded-full font-bold uppercase">
            {user?.role || "User"}
          </span>
          <button onClick={onLogout} className="ml-3 p-2 rounded-lg text-red-400 hover:text-white hover:bg-red-600/20">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
export default Topbar;