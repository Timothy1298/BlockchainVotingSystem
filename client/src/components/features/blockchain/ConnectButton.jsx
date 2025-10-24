import React from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';

export default function ConnectButton() {
  const { connectors, connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div>
        <span>
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={!connector.ready}
        >
          Connect to {connector.name}
        </button>
      ))}
    </div>
  );
}
