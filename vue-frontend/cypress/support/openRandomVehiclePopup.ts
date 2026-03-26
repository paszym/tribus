export const openRandomVehiclePopup = () => {
  cy.xpath('//*[@id="mapContainer"]/div[2]/div[4]/div[1]/div').click({ force: true })
}
