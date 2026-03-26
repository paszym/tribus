export const fillLoginFormAndSubmit = (email: string, password: string) => {
  cy.get('input[type="email"]').clear()
  cy.get('input[type="password"]').clear()

  cy.get('input[type="email"]').should('be.visible').type(email)
  cy.get('input[type="password"]').should('be.visible').type(password)

  cy.get('button[type="submit"]').should('be.visible').click()
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000)
}
