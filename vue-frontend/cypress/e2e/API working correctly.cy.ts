describe('API works correctly', () => {
  // ZTM
  it('ZTM: Vehicle positions', () => {
    const reqUrl = 'http://localhost:3000/ztm/positions'
    cy.request('GET', reqUrl).then((response) => {
      expect(response.status).to.eq(200)
    })
  })
  it('ZTM: Stop departures', () => {
    const reqUrl = 'http://localhost:3000/ztm/departures?stopId=1000'
    cy.request('GET', reqUrl).then((response) => {
      expect(response.status).to.eq(200)
    })
  })
  it('ZTM: Stops positions', () => {
    const reqUrl = 'http://localhost:3000/ztm/stops'
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
    const reqUrl = 'http://localhost:3000/users/login'

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
    const loginUrl = 'http://localhost:3000/users/login'
    const refreshUrl = 'http://localhost:3000/users/refresh'

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
    const loginUrl = 'http://localhost:3000/users/login'
    const logoutUrl = 'http://localhost:3000/users/logout'

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
