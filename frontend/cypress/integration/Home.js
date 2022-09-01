function makeEmail(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  result += "@testdomain.com";
  return result;
}

const randomEmail = makeEmail(10);

describe("renders the home page", () => {
  it("redirects user to sales page after user logged in", () => {
    cy.visit("/signup");
    cy.contains("Har du allerede en brukerkonto");
    cy.get("#email").type(randomEmail);
    cy.get("#displayName").type("Testbruker (Cypress)");
    cy.get("#password").type("test");
    cy.get("#password2").type("test");
    cy.findByText("Registrer").click();

    cy.visit("/login");
    cy.get("#email").type(randomEmail);
    cy.get("#password").type("test");
    cy.findByText("Logg inn").click();
    cy.url().should("include", "/sales");
    //cy.contains("Du er logget inn som").should("exist");

    //cy.visit("/");
    //cy.get("#container").should("exist");
    //cy.contains("Du er logget inn som " + randomUsername).should("exist");
  });
});
