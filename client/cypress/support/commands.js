// custom commands placeholder
Cypress.Commands.add('login', () => {
  // add auth mocking if needed
});

// Auto-connect mock wallet: inject a minimal window.ethereum that responds to request
Cypress.Commands.add('mockConnectWallet', () => {
  cy.window().then((win) => {
    // Only inject when the app indicates mock wallet support is enabled
    // by reading the env var exposed to the client.
    const enabled = win?.importMeta?.env?.VITE_ENABLE_MOCK_WALLET === 'true' || win?.VITE_ENABLE_MOCK_WALLET === 'true';
    if (!enabled) return;

    // Minimal provider that supports request
    const provider = {
      isMock: true,
      request: ({ method }) => {
        if (method === 'eth_requestAccounts' || method === 'eth_accounts') return Promise.resolve(['0x0000000000000000000000000000000000000001']);
        if (method === 'eth_chainId') return Promise.resolve('0x1');
        if (method === 'personal_sign' || method === 'eth_sign') return Promise.resolve('0xMOCKSIG');
        if (method === 'eth_sendTransaction') return Promise.resolve('0x' + 'a'.repeat(64));
        return Promise.resolve(null);
      },
      on: () => {},
      removeListener: () => {},
    };

    win.ethereum = provider;
    // dispatch connect event if app listens for it
    if (typeof win.dispatchEvent === 'function') {
      const ev = new Event('ethereum#initialized');
      win.dispatchEvent(ev);
    }
  });
});
