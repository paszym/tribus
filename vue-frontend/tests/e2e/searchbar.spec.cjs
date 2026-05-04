module.exports = {
  'Search bar works correctly': function (browser) {
    browser
      .url('http://localhost:5173')
      .waitForElementVisible('a[href="/stops"].rounded-md')
      .click('a[href="/stops"].rounded-md')
      .waitForElementVisible('input[type="text"]')
      .setValue('input[type="text"]', 'Karwiny')
      .pause(1000)
      .assert.textContains('table.min-w-full', 'Karwiny Nowowiczlińska (04)')
      .end()
  },
}
