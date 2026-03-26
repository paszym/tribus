import { fillLoginFormAndSubmit } from '../support/fillLoginFormAndSubmit'
import { logout } from '../support/logout'

describe('Logged in user can add to favourite on map', () => {
  it('Login works properly', () => {
    cy.visit('http://localhost:5173')
    cy.get('a[href="/login"].rounded-md').should('be.visible').click()
    fillLoginFormAndSubmit('test@abc.com', 'aaa')

    cy.xpath('/html/body/div[5]').should('contain', 'Błąd podczas logowania')

    cy.get('a[href="/register"].rounded-md').should('be.visible').click()
    fillLoginFormAndSubmit('test@abc.com', 'abcc')
    cy.xpath('/html/body/div[5]').should('contain', 'Błąd podczas rejestracji')

    fillLoginFormAndSubmit('test@abc.com', 'test')
    cy.xpath('/html/body/div[5]').should('contain', 'Błąd podczas rejestracji')

    cy.get('a[href="/login"].rounded-md').should('be.visible').click()
    fillLoginFormAndSubmit('test@abc.com', 'test')
    cy.xpath('//*[@id="app"]/nav/div/div/div/div[2]/div/p').should(
      'contain',
      'Zalogowany użytkownik:',
    )
    logout()
  })

  let stop: string = ''
  let initialFavoritesCount: number = 0

  it('Adds to favourites', () => {
    cy.visit('http://localhost:5173')
    cy.get('a[href="/login"].rounded-md').should('be.visible').click()
    fillLoginFormAndSubmit('test@abc.com', 'test')

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)

    cy.get('a[href="/stops"].rounded-md', { timeout: 10000 }).should('be.visible').click()

    cy.get('input[type="text"]').should('be.visible').type('dworzec głów')

    cy.xpath('//*[@id="app"]/div/div[1]/div[2]/table/tbody/tr[1]/td[1]/span')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        stop = text.trim()
      })

    // Save the initial number of favorites
    cy.xpath('//*[@id="app"]/div/div[1]/div[2]/table/tbody/tr')
      .should('have.length.greaterThan', 0)
      .then(($rows) => {
        initialFavoritesCount = $rows.length
      })

    // Add to favourites
    cy.xpath('//*[@id="app"]/div/div[1]/div[2]/table/tbody/tr[1]/td[3]/button')
      .should('be.visible')
      .click()

    // Check if the stop is added to favourites
    cy.xpath('//*[@id="app"]/div/div[1]/div[3]/div/table/tbody/tr')
      .should('have.length.greaterThan', 0)
      .each(($row) => {
        cy.wrap($row).invoke('text').should('contain', stop)
      })
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)
    logout()
  })

  it('Remove from favourites', () => {
    cy.visit('http://localhost:5173')
    cy.get('a[href="/login"].rounded-md').should('be.visible').click()
    fillLoginFormAndSubmit('test@abc.com', 'test')

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)

    cy.get('a[href="/stops"].rounded-md', { timeout: 10000 }).should('be.visible').click()

    cy.xpath('//*[@id="app"]/div/div[1]/div[3]/div/table/tbody/tr[1]/td[3]/button')
      .should('be.visible')
      .click()

    if (cy.xpath('//*[@id="app"]/div/div[1]/div[3]/div/table/tbody/tr').should('not.exist')) {
      cy.xpath('//*[@id="app"]/div/div[1]/div[3]/div/a').should(
        'contain',
        'Nie znaleziono ulubionych przystanków',
      )
    } else {
      cy.xpath('//*[@id="app"]/div/div[1]/div[3]/div/table/tbody/tr')
        .should('have.length', initialFavoritesCount - 1) // Check if favorites list length is reduced
        .each(($row) => {
          cy.wrap($row).invoke('text').should('not.contain', stop)
        })
    }
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000)
    logout()
  })
})
