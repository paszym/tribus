describe('Departure board works correctly', () => {
  it('Displays departure board for selected stop', () => {
    cy.visit('http://localhost:5173')
    cy.get('a[href="/stops"].rounded-md').should('be.visible').click()
    cy.get('input[type="text"]').should('be.visible').type('Dąbrowa Centrum')
    cy.xpath('//*[@id="app"]/div/div/div[2]/table/tbody/tr[1]/td[2]/button')
      .should('be.visible')
      .click()
    cy.xpath('//*[@id="app"]/div/div[2]').should('be.visible')
    cy.xpath('//*[@id="app"]/div/div[2]/h2')
      .should('be.visible')
      .and('contain', 'Dąbrowa Centrum 04')
  })
})
