describe('Vehicle popup works correctly', () => {
  it('vehicle popup opens and shows correct data', () => {
    let routeId: string = ''
    cy.visit('http://localhost:5173')
    const reqUrl = 'http://${API}/ztm/positions'
    cy.request('GET', reqUrl).then((response) => {
      expect(response.status).to.eq(200)
    })
    cy.xpath('//*[@id="mapContainer"]/div[2]/div[4]/div[1]/div')
      .invoke('text')
      .then((text) => {
        routeId = text.trim()
        cy.xpath('//*[@id="mapContainer"]/div[2]/div[4]/div[1]/div').click({ force: true })
        cy.xpath('//*[@id="mapContainer"]/div[2]/div[6]/div/div').should('contain', routeId)
      })
  })
})
