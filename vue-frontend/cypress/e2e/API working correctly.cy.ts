describe('API works correctly', () => {
  // ZTM
  it('ZTM: Vehicle positions', () => {
    const reqUrl = 'http://${API}/ztm/positions'
    cy.request('GET', reqUrl).then((response) => {
      expect(response.status).to.eq(200)
    })
  })
  it('ZTM: Stop departures', () => {
    const reqUrl = 'http://${API}/ztm/departures?stopId=1000'
    cy.request('GET', reqUrl).then((response) => {
      expect(response.status).to.eq(200)
    })
  })
  it('ZTM: Stops positions', () => {
    const reqUrl = 'http://${API}/ztm/stops'
    cy.request('GET', reqUrl).then((response) => {
      expect(response.status).to.eq(200)
    })
  })
  // users
  const correctData = {
    email: 'test@abc.com',
    password: 'test',
  }

  it('users: correct data: login user', () => {
    const reqUrl = 'http://${API}/users/login'

    cy.request({
      method: 'POST',
      url: reqUrl,
      body: correctData,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })
  it('users: refresh token data', () => {
    const loginUrl = 'http://${API}/users/login'
    const refreshUrl = 'http://${API}/users/refresh'

    cy.request({
      method: 'POST',
      url: loginUrl,
      body: correctData,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(200)

      const { refreshToken } = response.body

      cy.request({
        method: 'GET',
        url: refreshUrl,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      }).then((logoutResponse) => {
        expect(logoutResponse.status).to.eq(200)
      })
    })
  })
  it('users: logout user', () => {
    const loginUrl = 'http://${API}/users/login'
    const logoutUrl = 'http://${API}/users/logout'

    cy.request({
      method: 'POST',
      url: loginUrl,
      body: correctData,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(200)

      const { refreshToken } = response.body

      cy.request({
        method: 'POST',
        url: logoutUrl,
        body: { refreshToken },
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((logoutResponse) => {
        expect(logoutResponse.status).to.eq(200)
      })
    })
  })
})
