const express = require("express");
const DatabaseAPI = require("../services/mongodb-framework");
const constants = require("../services/database-constants");

const app = express.Router();

const database = new DatabaseAPI();

app.get("/", async (req, res) => {
  if (!(req.session.userId && req.session.displayName)) {
    res.status(401).json({
      error: "Du er ikke logget inn",
    });
    return;
  }

  let email = req.query.email;

  if (!email) {
    email = req.session.email;
  }

  const rating = await database.getRating(email);
  const numberOfRatings = await database.getAmountOfRatings(email);

  if (
    rating === constants.INVALID_TYPE ||
    numberOfRatings === constants.INVALID_TYPE
  ) {
    res.status(400).json({ error: "Ugyldig format" });
    return;
  }

  res.status(200).json({ rating, numberOfRatings });
});

app.post("/", async (req, res) => {
  if (!(req.session.userId && req.session.displayName)) {
    res.status(401).json({
      error: "Du er ikke logget inn",
    });
    return;
  }

  const { ratedEmail, givenRating } = req.body;
  const raterId = req.session.userId;

  if (!(ratedEmail && givenRating)) {
    res.status(400).json({ error: "Et nødvendig felt er ikke fylt ut" });
    return;
  }

  const status = await database.rate(raterId, ratedEmail, givenRating);

  if (status === constants.SUCCESS) {
    res.status(201).send("Rangerte bruker med e-post " + ratedEmail);
  } else if (status === constants.DUPLICATE_RATING) {
    res.status(400).json({ error: "Du har allerede rangert denne brukeren" });
  } else if (status === constants.DOES_NOT_EXIST) {
    res.status(400).json({ error: "Brukeren finnes ikke" });
  } else if (status === constants.INVALID_USER) {
    res.status(400).json({ error: "Du kan ikke gi rangering til deg selv" });
  } else if (status === constants.INVALID_TYPE) {
    res.status(400).json({ error: "Ugyldig format" });
  } else {
    res.status(500).json({ error: status /* "Det oppsto en feil" */ });
  }
});

module.exports = app;
