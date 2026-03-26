describe('Stop popup works correctly', () => {
  it('stop popup opens and shows correct data', () => {
    cy.visit('http://localhost:5173')

    cy.xpath('/html/body/div[1]/div').trigger('wheel', {
      wheelDelta: 1000,
      wheelDeltaY: 800,
      bubbles: true,
    })

    const reqUrl = 'http://${API}/ztm/departures?stopId=' + 2000

    cy.request('GET', reqUrl).then((response) => {
      expect(response.status).to.eq(200)
    })

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(6000)

    cy.xpath('//*[@id="mapContainer"]/div[2]/div[4]//div[contains(., "🚍")][3]').click({
      force: true,
    })
    cy.xpath('//*[@id="mapContainer"]/div[2]/div[6]/div').should('contain', 'Nazwa przystanku')
  })
})
