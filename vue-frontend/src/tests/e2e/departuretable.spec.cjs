module.exports = {
  'Departure board works correctly': function (browser) {
    browser
      .url('http://localhost:5173')
      .waitForElementPresent('a[href="/stops"].rounded-md')
      .click('a[href="/stops"].rounded-md')
      .waitForElementVisible('input[type="text"]')
      .setValue('input[type="text"]', 'Dąbrowa Centrum')
      .waitForElementVisible('button.bg-blue-500')
      .moveToElement('button.bg-blue-500', 0, 0)
      .click('button.bg-blue-500')
      .mouseButtonClick(0)
      .waitForElementVisible('h2.italic.bg-cyan-950')
      .assert.textContains('h2.italic.bg-cyan-950', 'Dąbrowa Centrum 04')
      .end()
  },
}
