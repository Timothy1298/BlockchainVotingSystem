import React from 'react';
import ConnectButton from './ConnectButton';

export default function AppLayout({ children }) {
  return (
    <div>
      <header style={{ padding: 16, borderBottom: '1px solid #eee', marginBottom: 24 }}>
        <ConnectButton />
      </header>
      <main style={{ padding: 16 }}>{children}</main>
    </div>
  );
}
