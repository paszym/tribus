export const logout = () => {
  cy.get('a[href="/logout"].rounded-md').should('be.visible').click()
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000)
  cy.xpath('/html/body/div[5]/div/p').should('contain', 'Pomyślnie wylogowano')
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000)
}
