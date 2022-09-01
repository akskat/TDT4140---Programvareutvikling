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

describe("renders the register page", () => {
  it("renders correctly", () => {
    cy.visit("/signup");
    cy.get("#container").should("exist");
    cy.contains("Har du allerede en brukerkonto").should("exist");
  });

  it("redirects user to login", () => {
    cy.visit("/signup");
    cy.contains("Har du allerede en brukerkonto").should("exist");
    cy.findByText("Logg inn her").click();
    cy.url().should("include", "/login");
    cy.contains("Har du ikke en brukerkonto").should("exist");
  });

  it("redirects user to sales page after signing up", () => {
    cy.visit("/signup");
    cy.contains("Har du allerede en brukerkonto");
    cy.get("#email").type(randomEmail);
    cy.get("#displayName").type("Testbruker (Cypress)");
    cy.get("#password").type("test");
    cy.get("#password2").type("test");
    cy.findByText("Registrer").click();
    cy.url().should("include", "/sales");
    //cy.contains("Du er logget inn som").should("exist");
  });

  it("remembers session after signing up", () => {
    cy.visit("/");
    cy.url().should("not.contain", "/login");
  });

  it("does not allow two instances of same email", () => {
    cy.visit("/signup");
    cy.get("#email").type(randomEmail);
    cy.get("#displayName").type("Testbruker (Cypress)");
    cy.get("#password").type("test");
    cy.get("#password2").type("test");
    cy.findByText("Registrer").click();
    cy.contains("E-postadressen er allerede i bruk").should("exist");
  });
});
