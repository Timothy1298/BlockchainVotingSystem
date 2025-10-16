// Cypress support file
import './commands';

// Auto-connect mock wallet when running Cypress if the client is configured
// to use the mock wallet. Tests can then assume window.ethereum is present.
before(() => {
	cy.mockConnectWallet();
});
