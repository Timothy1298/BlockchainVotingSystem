describe('Election wizard flow', () => {
  it('creates an election and previews on-chain', () => {
    cy.visit('/');
    // navigate to elections page - assumes there's a link with text Elections
    cy.contains('Elections').click();
    // fill the wizard form
    cy.get('#election-title').type('Test E2E Election');
    cy.get('#election-start').type('2025-11-01T09:00');
    cy.get('#election-end').type('2025-11-01T17:00');
    // candidate inputs
    cy.get('[id^=candidate-name-]').first().clear().type('Alice');
    cy.contains('Add candidate').click();
    cy.get('[id^=candidate-name-]').eq(1).type('Bob');
    // Click preview - the app will either perform a local preview or call preview endpoint
    cy.contains('Preview On-Chain').click();
    // wait for preview panel
    cy.contains('On-chain Preview').should('exist');
    // check that candidate names appear in preview
    cy.contains('Alice').should('exist');
    cy.contains('Bob').should('exist');
  });
});
