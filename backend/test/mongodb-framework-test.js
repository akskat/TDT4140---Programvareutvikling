const DatabaseAPI = require("../services/mongodb-framework");
const constants = require("../services/database-constants");
const expect = require("chai").expect;
const { verifyPassword } = require("../services/hashing");

const testEmail = "testuser@testdomain.com";
const testDisplayName = "Testbruker 1";
const testPassword = "testPassword123";
const testListingTitle = "TestTitle";
const testAdminPassword = "admin123";

const testEmailTwo = "testuser2@testdomain.com";
const testDisplayNameTwo = "Testbruker 2";

const testEmailThree = "testuser3@testdomain.com";
const testDisplayNameThree = "Testbruker 3";

let database = new DatabaseAPI();

describe("Test database functions", async function () {
  beforeEach(async function () {
    await database.connect();
    database.removeUser(testEmail);
    database.removeUser(testEmailTwo);
  });

  afterEach(async function () {
    const user = await database.getUser(testEmail, testPassword);
    await database.removeListing(testListingTitle, user._id);
    await database.removeUser(testEmail);
    await database.removeUser(testEmailTwo);
    await database.removeUser(testEmailThree);
    await database.disconnect();
  });

  context("Checking invalid input types", function () {
    it("(addUser)Input: number", async function () {
      let ret = await database.addUser(1);
      expect(ret).to.equal(constants.INVALID_TYPE);
    });

    it("(addUser)Input: empty string", async function () {
      let ret = await database.addUser("");
      expect(ret).to.equal(constants.INVALID_TYPE);
    });

    it("(addUser)Input: one string", async function () {
      let ret = await database.addUser("123abc");
      expect(ret).to.equal(constants.INVALID_TYPE);
    });

    it("(addUser)Input: nothing", async function () {
      let ret = await database.addUser();
      expect(ret).to.equal(constants.INVALID_TYPE);
    });

    it("(addUser)Input: object with name (as number), password and number", async function () {
      let ret = await database.addUser({ name: 1, password: "2", number: 4 });
      expect(ret).to.equal(constants.INVALID_TYPE);
    });

    it("(addUser)Input: object with name, password and _id", async function () {
      let ret = await database.addUser({ name: "1", password: "2", _id: 4 });
      expect(ret).to.equal(constants.INVALID_TYPE);
    });

    it("(addUser)Input: object with name, password, number and _id", async function () {
      let ret = await database.addUser({
        name: "1",
        password: "2",
        number: 1,
        _id: 4,
      });
      expect(ret).to.equal(constants.INVALID_TYPE);
    });

    it("(removeUser)Input: nothing", async function () {
      let ret = await database.removeUser();
      expect(ret).to.equal(constants.INVALID_TYPE);
    });

    it("(removeUser)Input: number", async function () {
      let ret = await database.removeUser(1);
      expect(ret).to.equal(constants.INVALID_TYPE);
    });

    it("(removeUser)Input: object", async function () {
      let ret = await database.removeUser({ name: "123", password: "abc" });
      expect(ret).to.equal(constants.INVALID_TYPE);
    });

    it("(getUser)Input: nothing", async function () {
      let ret = await database.getUser();
      expect(ret).to.equal(constants.INVALID_TYPE);
    });

    it("(getUser)Input: one number", async function () {
      let ret = await database.getUser(1);
      expect(ret).to.equal(constants.INVALID_TYPE);
    });

    it("(getUser)Input: two numbers", async function () {
      let ret = await database.getUser(1, 2);
      expect(ret).to.equal(constants.INVALID_TYPE);
    });

    it("(getUser)Input: only one string", async function () {
      let ret = await database.getUser("1");
      expect(ret).to.equal(constants.INVALID_TYPE);
    });

    it("(getUser)Input: object", async function () {
      let ret = await database.getUser({
        name: "123",
        password: "abc",
        number: 2,
      });
      expect(ret).to.equal(constants.INVALID_TYPE);
    });
  });

  context("Checking invalid User data", function () {
    it("Input: User with blank email, name and password", async function () {
      let ret = await database.addUser("", "", "");
      expect(ret).to.equal(constants.INVALID_EMAIL);
    });

    it("Input: User with name and blank password", async function () {
      let ret = await database.addUser(testEmail, "Testbruker 2", "");
      expect(ret).to.equal(constants.INVALID_PASSWORD);
    });

    it("Input: User with blank email and (not blank) password", async function () {
      let ret = await database.addUser("", "Testbruker 2", "123");
      expect(ret).to.equal(constants.INVALID_EMAIL);
    });

    it("Input: User with valid email and password, but blank display name", async function () {
      let ret = await database.addUser("testuser2@testdomain.com", "", "123");
      expect(ret).to.equal(constants.INVALID_DISPLAYNAME);
    });
  });

  context("Checking addition and deletion of user(s)", async function () {
    it("Adding user and removing user", async function () {
      console.log("Testing adding user");
      let ret = await database.addUser(
        testEmail,
        testDisplayName,
        testPassword
      );
      expect(ret).to.equal(constants.SUCCESS);
      let ret2 = await database.addUser(
        testEmail,
        testDisplayName,
        testPassword
      );
      expect(ret2).to.equal(constants.FAILED);

      console.log("Testing removing user");
      let ret3 = await database.removeUser(testEmail);
      expect(ret3).to.equal(constants.SUCCESS);
    });
  });

  context("Checking getting user(s)", async function () {
    it("Get user that does not exist", async function () {
      let ret = await database.getUser(testEmail, testPassword);
      expect(ret).to.equal(constants.FAILED);
    });

    it("Trying to get user with wrong password", async function () {
      await database.addUser(testEmail, testDisplayName, testPassword);

      let ret = await database.getUser(testEmail, "123abc");
      expect(ret).to.equal(constants.INVALID_PASSWORD);

      await database.removeUser(testEmail);
    });

    it("Get user with valid password", async function () {
      await database.addUser(testEmail, testDisplayName, testPassword);

      let ret = await database.getUser(testEmail, testPassword);
      expect(ret.email).to.equal(testEmail);
      expect(verifyPassword(testPassword, ret.password)).to.be.true;

      await database.removeUser(testEmail);
    });
  });

  context(
    "Checking addition, getting, deletion and toggling of listings",
    async function () {
      it("Adding and removing listing", async function () {
        await database.addUser(testEmail, testDisplayName, testPassword);
        const testUser = await database.getUser(testEmail, testPassword);

        const date = new Date();
        date.setYear(date.getFullYear() + 1);
        const ret = await database.addListing(
          testListingTitle,
          date,
          123,
          "TestDesc",
          "TestLocation",
          testUser._id
        );
        expect(ret).to.equal(constants.SUCCESS);

        const ret2 = await database.addListing(
          testListingTitle,
          date,
          123,
          "TestDesc",
          "TestLocation",
          testUser._id
        );
        expect(ret2).to.equal(constants.DUPLICATE_TITLE);

        const ret3 = await database.removeListing(
          testListingTitle,
          testUser._id
        );
        expect(ret3).to.equal(constants.SUCCESS);

        const ret4 = await database.removeListing(
          testListingTitle,
          testUser._id
        );
        expect(ret4).to.equal(constants.DOES_NOT_EXIST);

        await database.removeUser(testEmail);
      });

      it("Get listing", async function () {
        await database.addUser(testEmail, testDisplayName, testPassword);
        const testUser = await database.getUser(testEmail, testPassword);

        const ret = await database.getListing(testListingTitle, testUser._id);
        expect(ret).to.equal(constants.DOES_NOT_EXIST);

        const date = new Date();
        date.setYear(date.getFullYear() + 1);
        await database.addListing(
          testListingTitle,
          date,
          123,
          "TestDesc",
          "TestLocation",
          testUser._id
        );

        //This gets the same unique title as the add listing function does
        const ret2 = await database.getListing(testListingTitle, testUser._id);
        expect(ret2.title).to.equal(testListingTitle);
        expect(ret2.ownerId.toString()).to.equal(testUser._id.toString());

        await database.removeListing("testListingTitle", testUser._id);
        await database.removeUser(testEmail);
      });

      it("Test toggling of listings", async function () {
        await database.addUser(testEmail, testDisplayName, testPassword);
        const testUser = await database.getUser(testEmail, testPassword);

        const ret1 = await database.toggleListingActiveState(
          testListingTitle,
          testUser._id
        );
        expect(ret1).to.equal(constants.DOES_NOT_EXIST);

        const date = new Date();
        date.setYear(date.getFullYear() + 1);
        await database.addListing(
          testListingTitle,
          date,
          123,
          "TestDesc",
          "TestLocation",
          testUser._id
        );

        const ret2 = await database.toggleListingActiveState(
          testListingTitle,
          testUser._id
        );
        expect(ret2).to.equal(false);

        const ret3 = await database.toggleListingActiveState(
          testListingTitle,
          testUser._id
        );
        expect(ret3).to.equal(true);

        await database.removeListing(testListingTitle, testUser._id);
        await database.removeUser(testEmail);
      });
    }
  );

  context(
    "Checking addition, getting and deletion of report",
    async function () {
      it("Adding and removing report", async function () {
        const user1 = await database.addUser(
          testEmail,
          testDisplayName,
          testPassword
        );

        const user2 = await database.addUser(
          "testuser2@testdomain.com",
          "Testbruker 2",
          testPassword
        );

        const user1Id = String(
          (await database.getUser(testEmail, testPassword))._id
        );
        const user2Id = String(
          (await database.getUser("testuser2@testdomain.com", testPassword))._id
        );

        const description = "'Testbruker 1' scamma meg!!";

        await database.addReport(user1Id, user2Id, description);

        const allReports = await database.getAllReports();
        const report = Array.from(allReports).find(
          (report) => report.description === description
        );

        expect(report.description).to.equal(description);

        await database.removeReport(String(report._id));

        const allReports2 = await database.getAllReports();
        const report2 = allReports2.find(
          (report) => report.description === description
        );

        expect(report2).to.be.undefined;
      });
    }
  );

  context(
    "Add ratings and check that you cannot add more than one rating",
    async function () {
      it("Checking addition and getting of ratings", async function () {
        await database.addUser(testEmail, testDisplayName, testPassword);
        const testUser = await database.getUser(testEmail, testPassword);
        await database.addUser(testEmailTwo, testDisplayNameTwo, testPassword);
        const testUserTwo = await database.getUser(testEmailTwo, testPassword);
        await database.addUser(
          testEmailThree,
          testDisplayNameThree,
          testPassword
        );
        const testUserThree = await database.getUser(
          testEmailThree,
          testPassword
        );

        const ret0 = await database.getAmountOfRatings(testEmailTwo);
        expect(ret0).to.equal(0);

        const ret = await database.getRating(testEmailTwo);
        expect(ret).to.equal(null);

        const ret2 = await database.rate(testUser._id, testEmailTwo, 2);
        expect(ret2).to.equal(constants.SUCCESS);

        const ret2point5 = await database.getAmountOfRatings(testEmailTwo);
        expect(ret2point5).to.equal(1);

        const ret3 = await database.rate(testUser._id, testEmailTwo, 2);
        expect(ret3).to.equal(constants.DUPLICATE_RATING);

        const ret3point5 = await database.getAmountOfRatings(testEmailTwo);
        expect(ret3point5).to.equal(1);

        const ret4 = await database.getRating(testEmailTwo);
        expect(ret4).to.equal(2);

        const ret5 = await database.rate(testUserThree._id, testEmailTwo, 3);
        expect(ret5).to.equal(constants.SUCCESS);

        const ret6 = await database.getRating(testEmailTwo);
        expect(ret6).to.equal(2.5);

        const ret7 = await database.getAmountOfRatings(testEmailTwo);
        expect(ret7).to.equal(2);
      });
    }
  );

  context("Check admin functions", async function () {
    it("Check if user can be blocked and unblocked", async function () {
      const user = await database.addUser(
        testEmail,
        testDisplayName,
        testPassword
      );
      const adminUser = await database.getUser(
        constants.adminEmail,
        testAdminPassword
      );

      const ret0 = await database.getUser(testEmail, testPassword);
      expect(ret0.isBanned).to.equal(false);

      const ret = await database.adminSetBlock(adminUser._id, testEmail, true);
      expect(ret).to.equal(constants.SUCCESS);

      const ret1 = await database.getUser(testEmail, testPassword);
      expect(ret1.isBanned).to.equal(true);

      const ret2 = await database.adminSetBlock(
        adminUser._id,
        testEmail,
        false
      );
      expect(ret2).to.equal(constants.SUCCESS);

      const ret3 = await database.getUser(testEmail, testPassword);
      expect(ret3.isBanned).to.equal(false);
    });
  });

  context(
    "Check if it's possible to add soldToEmail to listing",
    async function () {
      it("Check if a user can add soldToEmail to a listing", async function () {
        await database.addUser(testEmail, testDisplayName, testPassword);
        const testUser = await database.getUser(testEmail, testPassword);
        await database.addUser(testEmailTwo, testDisplayNameTwo, testPassword);
        const testUserTwo = await database.getUser(testEmailTwo, testPassword);

        const date = new Date();
        date.setYear(date.getFullYear() + 1);
        await database.addListing(
          testListingTitle,
          date,
          123,
          "TestDesc",
          "TestLocation",
          testUser._id
        );

        const testListingTitle2 = testListingTitle + "2";
        const date2 = new Date();
        date.setYear(date.getFullYear() + 2);
        await database.addListing(
          testListingTitle2,
          date,
          123,
          "TestDesc",
          "TestLocation",
          testUser._id
        );

        const test_listings = await database.getAllListings();

        const ret = await database.setSoldToEmail(
          testListingTitle,
          testUser._id,
          testUserTwo.email
        );
        expect(ret).to.equal(constants.SUCCESS);

        const ret2 = await database.getAllPurchases(testUserTwo.email);
        expect(ret2).to.be.an("array");
        expect(ret2[0].title).to.equal(testListingTitle);

        const ret3 = await database.setSoldToEmail(
          testListingTitle2,
          testUser._id,
          testUserTwo.email
        );
        expect(ret3).to.equal(constants.SUCCESS);

        const ret4 = await database.getAllPurchases(testUserTwo.email);
        expect(ret4).to.be.an("array");
        expect(ret4.length).to.equal(2);
        expect(ret4[0].title).to.oneOf([testListingTitle, testListingTitle2]);
        expect(ret4[1].title).to.oneOf([testListingTitle, testListingTitle2]);
      });
    }
  );
});
