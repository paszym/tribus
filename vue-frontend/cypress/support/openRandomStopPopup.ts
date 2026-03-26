export const openRandomStopPopup = () => {
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
}
