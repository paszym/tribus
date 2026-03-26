import { fillLoginFormAndSubmit } from '../support/fillLoginFormAndSubmit'

describe('Map and stops lists working', () => {
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
  it('Logged in user can add to favourite on map', () => {
    cy.visit('http://localhost:5173')
    cy.get('a[href="/login"].rounded-md').should('be.visible').click()
    fillLoginFormAndSubmit('mail.459841@gmail.com', 'chuj')

    let stop: string = ''
    let initialFavoritesCount: number = 0

    cy.get('a[href="/stops"].rounded-md').should('be.visible').click()
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

    // Remove from favourites
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
  })
  it('Login works correctly', () => {
    cy.visit('http://localhost:5173')
    cy.get('a[href="/login"].rounded-md').should('be.visible').click()
    fillLoginFormAndSubmit('mail.459841@gmail.com', 'abd')
    cy.xpath('/html/body/div[5]').should('contain', 'Błąd podczas logowania')

    cy.get('a[href="/register"].rounded-md').should('be.visible').click()
    fillLoginFormAndSubmit('mail.459841@gmail.com', 'abd')
    cy.xpath('/html/body/div[5]').should('contain', 'Błąd podczas rejestracji')

    cy.get('a[href="/login"].rounded-md').should('be.visible').click()
    fillLoginFormAndSubmit('mail.459841@gmail.com', 'chuj')
    cy.xpath('//*[@id="app"]/nav/div/div/div/div[2]/div/p').should(
      'contain',
      'Zalogowany użytkownik:',
    )
  })
  it('Stop popup works correctly', () => {
    cy.visit('http://localhost:5173')
    cy.xpath('/html/body/div[1]/div').trigger('wheel', {
      deltaY: -100.666666,
      wheelDelta: 500,
      wheelDeltaX: 0,
      wheelDeltaY: 500,
      bubbles: true,
    })
    cy.xpath(
      '//*[@id="mapContainer"]/div[2]/div[4]//div[contains(@class, "leaflet-marker-icon") and contains(., "🚍")][1]',
    ).click()
    cy.xpath('//*[@id="mapContainer"]/div[2]/div[6]/div').should('contain', 'Nazwa przystanku')
  })
  it('Vehicle popup works correctly', () => {
    cy.visit('http://localhost:5173')
    cy.xpath('//*[@id="mapContainer"]/div[2]/div[4]/div[1]/div')
      .invoke('text')
      .then((text) => {
        const routeId = text.trim()
        cy.xpath('//*[@id="mapContainer"]/div[2]/div[4]/div[1]/div').click({ force: true })
        cy.xpath('//*[@id="mapContainer"]/div[2]/div[6]/div/div').should('contain', routeId)
      })
  })
})
