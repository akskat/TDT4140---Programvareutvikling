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

describe("renders the login page", () => {
  //beforeEach(() => {
  //  cy.visit("/");
  //});
  it("renders correctly", () => {
    cy.visit("/login");
    cy.get("#container").should("exist");
    cy.findAllByText("Logg inn her!").should("exist");
  });

  it("redirects user to sign up", () => {
    cy.visit("/login");
    cy.findAllByText("Registrer deg her").click();
    cy.url().should("include", "/signup");
    cy.findAllByText("Registrer deg").should("exist");
  });

  it("redirects user to sales page after user logged in", () => {
    cy.visit("/login");
    cy.findAllByText("Registrer deg her").click();
    cy.url().should("include", "/signup");
    cy.findAllByText("Registrer deg").should("exist");

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
  });

  it("lets you sign in again after signing out", () => {
    cy.visit("/login");
    cy.get("#email").type(randomEmail);
    cy.get("#password").type("test");
    cy.findByText("Logg inn").click();

    cy.findByText("Logg ut").click();

    cy.visit("/login");
    cy.get("#email").type(randomEmail);
    cy.get("#password").type("test");
    cy.findByText("Logg inn").click();
    cy.url().should("include", "/sales");
    //cy.contains("Du er logget inn som").should("exist");
  });

  it("remembers session after signing in", () => {
    cy.visit("/");
    cy.url().should("not.contain", "/login");
  });

  it("notifies when user does not exist", () => {
    cy.visit("/login");
    cy.get("#email").type(makeEmail(10));
    cy.get("#password").type("test");
    cy.findByText("Logg inn").click();
    cy.contains("Det finnes ingen bruker").should("exist");
  });

  it("does not let you in when password is incorrect", () => {
    cy.visit("/login");
    cy.get("#email").type(randomEmail);
    cy.get("#password").type("feil_passord");
    cy.findByText("Logg inn").click();
    cy.contains("Feil passord").should("exist");
  });
});
