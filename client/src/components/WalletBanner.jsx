import React from 'react';

export default function WalletBanner() {
  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';
  const enableMock = import.meta.env.VITE_ENABLE_MOCK_WALLET === 'true';

  if (projectId) return null; // only show banner when WalletConnect is disabled

  return (
    <div className="w-full bg-yellow-600/95 text-gray-900 text-sm py-2 px-4 flex items-center justify-center">
      <div className="max-w-7xl w-full flex items-center justify-between">
        <div>
          <strong>WalletConnect disabled</strong>
          <span className="ml-2">— set <code className="bg-gray-100 px-1 rounded">VITE_WALLETCONNECT_PROJECT_ID</code> to enable.</span>
        </div>
        <div className="text-xs opacity-90">
          {enableMock ? (
            <span>Mock wallet enabled (VITE_ENABLE_MOCK_WALLET=true)</span>
          ) : (
            <span>To enable production wallets, register a WalletConnect project id.</span>
          )}
        </div>
      </div>
    </div>
  );
}
