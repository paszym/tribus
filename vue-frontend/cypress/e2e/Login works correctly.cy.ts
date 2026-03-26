import { fillLoginFormAndSubmit } from '../support/fillLoginFormAndSubmit'

describe('Login works correctly', () => {
  it('User can log in', () => {
    cy.visit('http://localhost:5173')
    cy.get('a[href="/login"].rounded-md').should('be.visible').click()
    fillLoginFormAndSubmit('test@abc.com', 'abd')
    cy.xpath('/html/body/div[5]').should('contain', 'Błąd podczas logowania')

    cy.get('a[href="/register"].rounded-md').should('be.visible').click()
    fillLoginFormAndSubmit('test@abc.com', 'abd')
    cy.xpath('/html/body/div[5]').should('contain', 'Błąd podczas rejestracji')

    cy.get('a[href="/login"].rounded-md').should('be.visible').click()
    fillLoginFormAndSubmit('test@abc.com', 'test')
    cy.xpath('//*[@id="app"]/nav/div/div/div/div[2]/div/p').should(
      'contain',
      'Zalogowany użytkownik:',
    )
  })
})
