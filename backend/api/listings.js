const express = require("express");
const DatabaseAPI = require("../services/mongodb-framework");
const constants = require("../services/database-constants");

const app = express.Router();

const database = new DatabaseAPI();

// Endpoint for fetching all listings or a specific listing
app.get("/", async (req, res) => {
  if (!(req.session.userId && req.session.displayName)) {
    res.status(401).json({
      error: "Du er ikke logget inn",
    });
    return;
  }

  const { title } = req.body;
  const ownerId = req.session.userId;

  if (title && ownerId) {
    // If title and ownerId is provided in request, fetch specific listing
    const listing = await database.getListing(title, ownerId);

    if (typeof listing !== "number") {
      res.json(listing);
    } else if (listing === constants.DOES_NOT_EXIST) {
      res.status(400).json({ error: "Annonsen finnes ikke" });
    } else if (listing === constants.INVALID_TYPE) {
      res.status(400).json({ error: "Ugyldig format" });
    } else {
      res.status(500).json({ error: "Det oppsto en feil" });
    }
  } else if (Object.keys(req.body).length === 0) {
    // If no parameters are provided, fetch all listings
    const listings = await database.getAllListings();
    res.json(listings);
  } else {
    res.status(400).json({ error: "Ugyldig format" });
  }
});

// Endpoint for fetching your own listings
app.get("/own", async (req, res) => {
  if (!(req.session.userId && req.session.displayName)) {
    res.status(401).json({
      error: "Du er ikke logget inn",
    });
    return;
  }

  const ownerId = req.session.userId;

  if (Object.keys(req.body).length === 0) {
    // If no parameters are provided, fetch all listings
    const listings = await database.getYourListings(ownerId);
    res.json(listings);
  } else {
    res.status(400).json({ error: "Ugyldig format" });
  }
});

// Endpoint for fetching listings you have purchased
app.get("/purchased", async (req, res) => {
  if (!(req.session.userId && req.session.displayName)) {
    res.status(401).json({
      error: "Du er ikke logget inn",
    });
    return;
  }

  const email = req.session.email;

  if (Object.keys(req.body).length === 0) {
    // If no parameters are provided, fetch all listings
    const listings = await database.getAllPurchases(email);
    res.json(listings);
  } else {
    res.status(400).json({ error: "Ugyldig format" });
  }
});

// Endpoint for creating new listing
app.post("/", async (req, res) => {
  if (!(req.session.userId && req.session.displayName)) {
    res.status(401).json({
      error: "Du er ikke logget inn",
    });
    return;
  }

  const { title, date, price, description, location } = req.body;
  const ownerId = req.session.userId;

  if (!(title && date && price && description && location)) {
    res.status(400).json({ error: "Et nødvendig felt er ikke fylt ut" });
    return;
  }

  const status = await database.addListing(
    title,
    date,
    price,
    description,
    location,
    ownerId
  );

  if (status === constants.SUCCESS) {
    res.status(201).send("Opprettet ny annonse med tittel " + title);
  } else if (status === constants.INVALID_TYPE) {
    res.status(400).json({ error: "Ugyldig format" });
  } else if (status === constants.INVALID_TITLE) {
    res.status(400).json({ error: "Ugyldig tittel" });
  } else if (status === constants.INVALID_DATE) {
    res.status(400).json({
      error:
        "Ugyldig dato. Kan ikke velge tidligere datoer. Må velge dagens dato eller senere.",
    });
  } else if (status === constants.INVALID_PRICE) {
    res.status(400).json({ error: "Ugyldig pris" });
  } else if (status === constants.INVALID_DESCRIPTION) {
    res.status(400).json({ error: "Ugyldig beskrivelse" });
  } else if (status === constants.INVALID_LOCATION) {
    res.status(400).json({ error: "Ugyldig sted" });
  } else {
    res.status(500).json({ error: "Det oppsto en feil" });
  }
});

// Endpoint for marking a listing as sold
app.patch("/mark-as-sold/", async (req, res) => {
  if (!(req.session.userId && req.session.displayName)) {
    res.status(401).json({
      error: "Du er ikke logget inn",
    });
    return;
  }

  const { title, soldToEmail } = req.body;
  const ownerId = req.session.userId;

  if (!(title && ownerId && soldToEmail)) {
    res.status(400).json({ error: "Ugyldig format" });
    return;
  }

  const status = await database.setSoldToEmail(title, ownerId, soldToEmail);

  if (status === constants.SUCCESS) {
    res
      .status(200)
      .send(
        "Annonse med tittel " + title + " ble satt som solgt til " + soldToEmail
      );
  } else if (status === constants.DOES_NOT_EXIST) {
    res.status(400).json({ error: "Denne brukeren finnes ikke" });
  } else if (status === constants.INVALID_TYPE) {
    res.status(400).json({ error: "Ugyldig format" });
  } else {
    res.status(500).json({ error: "Det oppsto en feil" });
    console.log(status);
  }
});

// Endpoint for removing a listing
app.delete("/", async (req, res) => {
  if (!(req.session.userId && req.session.displayName)) {
    res.status(401).json({
      error: "Du er ikke logget inn",
    });
    return;
  }

  const { title } = req.body;
  const ownerId = req.session.userId;

  if (!(title && ownerId)) {
    res.status(400).json({ error: "Mangler tittel" });
    return;
  }

  const status = await database.removeListing(title, ownerId);

  if (status === constants.SUCCESS) {
    res.status(200).send("Slettet annonse med tittel " + title);
  } else if (status === constants.DOES_NOT_EXIST) {
    res.status(400).json({ error: "Annonsen finnes ikke" });
  } else if (status === constants.INVALID_TYPE) {
    res.status(400).json({ error: "Ugyldig format" });
  } else {
    res.status(500).json({ error: "Det oppsto en feil" });
  }
});

module.exports = app;
