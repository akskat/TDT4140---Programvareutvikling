const { expect } = require("chai");
const { hashPassword, verifyPassword } = require("../services/hashing.js");

it("Hashes passwords properly", () => {
  const hash1 = hashPassword("password");
  const hash2 = hashPassword("Password");

  expect(verifyPassword("password", hash1)).to.be.true;
  expect(verifyPassword("Password", hash2)).to.be.true;

  expect(verifyPassword("password", hash2)).to.be.false;
  expect(verifyPassword("Password", hash1)).to.be.false;
});
