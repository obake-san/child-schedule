describe('トップページ', () => {
  it('タイトルとフッターが表示される', () => {
    cy.visit('http://localhost:5173/')
    cy.contains('楽々キッズかれんだぁ')
    cy.get('footer').should('exist')
    cy.contains('Top')
  })
})
