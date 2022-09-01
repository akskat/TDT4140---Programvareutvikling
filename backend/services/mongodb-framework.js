const { MAX_RATING } = require("./database-constants");
const constants = require("./database-constants");
const { hashPassword, verifyPassword } = require("./hashing");

function DatabaseAPI() {
  this.mongoose = require("mongoose");
  this.User = require("../models/User");
  this.Listing = require("../models/Listing");
  this.Report = require("../models/Report");
}

DatabaseAPI.prototype.connect = async function () {
  try {
    await this.mongoose.connect(
      "mongodb+srv://LettBilletData:TAr6ELCBA3dmDfb@cluster0.mwyjc.mongodb.net/LettBillett2?retryWrites=true&w=majority",
      {
        autoIndex: true,
      }
    );
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
  return constants.SUCCESS;
};

DatabaseAPI.prototype.disconnect = async function () {
  try {
    this.mongoose.connection.close();
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
  return constants.SUCCESS;
};

DatabaseAPI.prototype.addUser = async function (email, displayName, password) {
  try {
    if (
      typeof email != "string" ||
      typeof displayName != "string" ||
      typeof password != "string"
    ) {
      return constants.INVALID_TYPE;
    }
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }

  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (!regex.test(email)) {
    return constants.INVALID_EMAIL;
  }
  if (displayName == "") {
    return constants.INVALID_DISPLAYNAME;
  }
  if (password == "") {
    return constants.INVALID_PASSWORD;
  }

  const userToBeAdded = new this.User({
    email,
    displayName,
    password: hashPassword(password),
    isBanned: false,
  });

  try {
    const matchingUser = await this.User.findOne({ email: email });
    if (matchingUser != null) return constants.FAILED;
    const addUser = new this.User(userToBeAdded);
    await addUser.save();
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
  return constants.SUCCESS;
};

DatabaseAPI.prototype.removeUser = async function (givenEmail) {
  try {
    if (typeof givenEmail != "string") return constants.INVALID_TYPE;
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }

  if (givenEmail.length <= 0) {
    return constants.INVALID_EMAIL;
  }

  try {
    const userToRemove = await this.User.findOne({ email: givenEmail });

    if (userToRemove == null) return constants.FAILED;

    await this.Listing.deleteMany({ ownerId: userToRemove._id });

    await this.User.findOneAndRemove({ email: givenEmail });
    return constants.SUCCESS;
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
};

DatabaseAPI.prototype.adminSetBlock = async function (
  adminUserId,
  blockUserEmail,
  isBlocked
) {
  try {
    if (
      !(
        typeof adminUserId == "string" ||
        adminUserId instanceof this.mongoose.Types.ObjectId
      ) ||
      typeof blockUserEmail != "string" ||
      typeof isBlocked != "boolean"
    ) {
      return constants.INVALID_TYPE;
    }
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }

  try {
    const adminUser = await this.User.findById(adminUserId);
    if (adminUser.email != constants.adminEmail) return constants.NOT_ADMIN;

    const blockedUser = await this.User.findOne({ email: blockUserEmail });
    if (blockedUser == null) {
      return constants.DOES_NOT_EXIST;
    }

    blockedUser.isBanned = isBlocked;
    await blockedUser.save();

    await this.Report.deleteMany({
      reportedUserId: blockedUser._id,
    });

    return constants.SUCCESS;
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
};

DatabaseAPI.prototype.getUser = async function (givenEmail, givenPassword) {
  try {
    if (typeof givenEmail != "string" || typeof givenPassword != "string")
      return constants.INVALID_TYPE;
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }
  try {
    const UserMatch = await this.User.findOne({ email: givenEmail });
    if (verifyPassword(givenPassword, UserMatch.password)) return UserMatch;
    return constants.INVALID_PASSWORD;
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
};

function getUniqueListingTitleLocal(title, ownerIdString) {
  if (typeof title != "string" || typeof ownerIdString != "string")
    return constants.INVALID_TYPE;
  return title + ownerIdString;
}

// Other functions of DatabaseAPI cannot use this function, so we created a local version so it works.
DatabaseAPI.prototype.getUniqueListingTitle = function (title, ownerIdString) {
  return getUniqueListingTitleLocal(title, ownerIdString);
};

DatabaseAPI.prototype.addListing = async function (
  l_title,
  l_date,
  l_price,
  l_desc,
  l_location,
  l_ownerId
) {
  const parsedDate = new Date(l_date);

  try {
    if (
      typeof l_title != "string" ||
      !(parsedDate instanceof Date) ||
      typeof l_price != "number" ||
      typeof l_desc != "string" ||
      typeof l_location != "string" ||
      !(
        typeof l_ownerId == "string" ||
        l_ownerId instanceof this.mongoose.Types.ObjectId
      )
    ) {
      return constants.INVALID_TYPE;
    }
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }

  if (l_title == "") return constants.INVALID_TITLE;
  if (Date.now() > parsedDate) return constants.INVALID_DATE;
  if (l_price < 0) return constants.INVALID_PRICE;
  if (l_desc == "") return constants.INVALID_DESC;
  if (l_location == "") return constants.INVALID_LOC;
  if ((await this.User.findById(l_ownerId)) == null)
    return constants.INVALID_O_ID;

  try {
    if (
      (await this.Listing.findOne({ title: l_title, ownerId: l_ownerId })) !=
      null
    ) {
      return constants.DUPLICATE_TITLE;
    }

    const listingToAdd = new this.Listing({
      title: l_title,
      date: parsedDate,
      price: l_price,
      description: l_desc,
      location: l_location,
      ownerId: l_ownerId,
      active: true,
    });
    await listingToAdd.save();
    return constants.SUCCESS;
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
};

DatabaseAPI.prototype.removeListing = async function (
  given_title,
  given_ownerId
) {
  try {
    if (
      typeof given_title != "string" ||
      !(
        typeof given_ownerId == "string" ||
        given_ownerId instanceof this.mongoose.Types.ObjectId
      )
    )
      return constants.INVALID_TYPE;
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }

  try {
    const listingMatch = await this.Listing.findOneAndDelete({
      title: given_title,
      ownerId: given_ownerId,
    });
    if (listingMatch == null) return constants.DOES_NOT_EXIST;
    return constants.SUCCESS;
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
};

DatabaseAPI.prototype.getListing = async function (given_title, given_ownerId) {
  try {
    if (
      typeof given_title != "string" ||
      !(
        typeof given_ownerId == "string" ||
        given_ownerId instanceof this.mongoose.Types.ObjectId
      )
    )
      return constants.INVALID_TYPE;
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }

  try {
    const listingMatch = await this.Listing.findOne({
      title: given_title,
      ownerId: given_ownerId,
    });
    if (listingMatch == null) return constants.DOES_NOT_EXIST;
    return listingMatch;
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
};

DatabaseAPI.prototype.toggleListingActiveState = async function (
  given_title,
  given_ownerId
) {
  try {
    if (
      typeof given_title != "string" ||
      !(
        typeof given_ownerId == "string" ||
        given_ownerId instanceof this.mongoose.Types.ObjectId
      )
    )
      return constants.INVALID_TYPE;
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }

  try {
    const listingMatch = await this.Listing.findOne({
      title: given_title,
      ownerId: given_ownerId,
    });
    if (listingMatch == null) return constants.DOES_NOT_EXIST;
    listingMatch.active = !listingMatch.active;
    await listingMatch.save();
    return listingMatch.active;
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
};

DatabaseAPI.prototype.getAllListings = async function () {
  const listings = await this.Listing.find({ active: true }).lean();

  const listingsWithOwnerInfo = [];
  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    const user = await this.User.findById(listing.ownerId).lean();

    if (!user) {
      continue;
    }

    const { email, displayName } = user;

    listingsWithOwnerInfo.push({
      ...listing,
      email,
      displayName,
    });
  }

  return listingsWithOwnerInfo;
};

DatabaseAPI.prototype.getYourListings = async function (userId) {
  const listings = await this.Listing.find({ ownerId: userId }).lean();

  const listingsWithOwnerInfo = [];
  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    const user = await this.User.findById(listing.ownerId).lean();

    if (!user) {
      continue;
    }

    const { email, displayName } = user;

    listingsWithOwnerInfo.push({
      ...listing,
      email,
      displayName,
    });
  }

  return listingsWithOwnerInfo;
};

DatabaseAPI.prototype.rate = async function (raterId, ratedEmail, givenRating) {
  try {
    if (
      !(
        typeof raterId == "string" ||
        raterId instanceof this.mongoose.Types.ObjectId
      ) ||
      typeof ratedEmail != "string" ||
      typeof givenRating != "number"
    )
      return constants.INVALID_TYPE;
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }

  const ratedUser = await this.User.findOne({ email: ratedEmail });
  if (ratedUser == null) return constants.DOES_NOT_EXIST;

  // A user cannot rate oneself
  if (ratedUser._id.toString() == raterId.toString())
    return constants.INVALID_USER;

  for (const element of ratedUser.ratings) {
    if (element.raterId.toString() == raterId.toString())
      return constants.DUPLICATE_RATING;
  }

  if (
    givenRating > constants.MAX_RATING ||
    givenRating < constants.MIN_RATING
  ) {
    return constants.INVALID_RATING;
  }

  ratedUser.ratings.push({ raterId: raterId, rating: givenRating });

  try {
    await ratedUser.save();
    return constants.SUCCESS;
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
};

DatabaseAPI.prototype.addReport = async function (
  userId,
  reportedUserId,
  description
) {
  try {
    if (
      typeof userId != "string" ||
      typeof reportedUserId != "string" ||
      typeof description != "string"
    ) {
      return constants.INVALID_TYPE;
    }
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }

  if (description == "") return constants.INVALID_DESC;

  const reportToBeAdded = new this.Report({
    userId,
    reportedUserId,
    description,
  });

  try {
    const addReport = new this.Report(reportToBeAdded);
    await addReport.save();
    return constants.SUCCESS;
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
};

DatabaseAPI.prototype.getAmountOfRatings = async function (userEmail) {
  try {
    if (typeof userEmail != "string") return constants.INVALID_TYPE;
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }

  const ratedUser = await this.User.findOne({ email: userEmail });
  if (ratedUser == null) return constants.DOES_NOT_EXIST;
  return ratedUser.ratings.length;
};

DatabaseAPI.prototype.getRating = async function (userEmail) {
  try {
    if (typeof userEmail != "string") return constants.INVALID_TYPE;
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }

  const ratedUser = await this.User.findOne({ email: userEmail });
  if (ratedUser == null) return constants.DOES_NOT_EXIST;

  if (ratedUser.ratings.length == 0) {
    return null;
  }

  let sum = 0;
  for (const element of ratedUser.ratings) {
    sum += element.rating;
  }
  return sum / ratedUser.ratings.length;
};

DatabaseAPI.prototype.getAllReports = async function () {
  try {
    const reports = await this.Report.find({}).lean();

    const reportsWithUserInfo = [];
    for (let i = 0; i < reports.length; i++) {
      const report = reports[i];

      const user = await this.User.findById(report.userId).lean();
      const reportedUser = await this.User.findById(
        report.reportedUserId
      ).lean();

      if (!(user && reportedUser)) {
        continue;
      }

      const numberOfTimesReported = reports.filter(
        (report) => report.reportedUserId === reportedUser._id.toString()
      ).length;

      const { email, displayName } = user;
      const { email: reportedEmail, displayName: reportedDisplayName } =
        reportedUser;

      reportsWithUserInfo.push({
        ...report,
        email,
        displayName,
        reportedEmail,
        reportedDisplayName,
        numberOfTimesReported,
      });
    }
    return reportsWithUserInfo;
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
};

DatabaseAPI.prototype.removeReport = async function (reportId) {
  try {
    if (typeof reportId != "string") return constants.INVALID_TYPE;
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }

  try {
    await this.Report.findOneAndRemove({ _id: reportId });
    return constants.SUCCESS;
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
};

DatabaseAPI.prototype.setSoldToEmail = async function (
  given_title,
  given_ownerId,
  soldToEmail
) {
  let listing;
  try {
    if (typeof soldToEmail != "string") return constants.INVALID_TYPE;
    listing = await this.getListing(given_title, given_ownerId);
    if (!(listing instanceof this.Listing)) {
      return listing;
    }
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }

  const soldToUser = await this.User.findOne({ email: soldToEmail });
  if (soldToUser == null) return constants.DOES_NOT_EXIST;

  try {
    listing.soldToEmail = soldToEmail;
    listing.active = false;
    await listing.save();
    return constants.SUCCESS;
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
};

DatabaseAPI.prototype.getAllPurchases = async function (given_email) {
  try {
    if (typeof given_email != "string") return constants.INVALID_TYPE;
  } catch (err) {
    console.log(err);
    return constants.INVALID_TYPE;
  }

  try {
    const listings = await this.Listing.find({
      soldToEmail: given_email,
    }).lean();

    const listingsWithOwnerInfo = [];
    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      const user = await this.User.findById(listing.ownerId).lean();

      if (!user) {
        continue;
      }

      const { email, displayName } = user;

      listingsWithOwnerInfo.push({
        ...listing,
        email,
        displayName,
      });
    }

    return listingsWithOwnerInfo;
  } catch (err) {
    console.log(err);
    return constants.FAILED;
  }
};

module.exports = DatabaseAPI;
