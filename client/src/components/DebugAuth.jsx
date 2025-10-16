import React from 'react';
import API from '../services/api';

export default function DebugAuth() {
  if (import.meta.env.PROD) return null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return (
    <div className="hidden md:flex items-center gap-3 text-xs text-gray-300 bg-gray-900/60 px-3 py-1 rounded">
      <div>Token: <code className="ml-1">{token ? `${String(token).slice(0,8)}...${String(token).slice(-6)}` : 'none'}</code></div>
      <div>AxiosAuth: <code className="ml-1">{API.defaults.headers.Authorization ? 'set' : 'unset'}</code></div>
    </div>
  );
}
