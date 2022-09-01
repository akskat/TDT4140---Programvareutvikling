const express = require("express");
const DatabaseAPI = require("../services/mongodb-framework");
const constants = require("../services/database-constants");

const app = express.Router();

const database = new DatabaseAPI();

// Endpoint for fetching all user reports
app.get("/", async (req, res) => {
  // TODO: Check that user is logged in as admin
  if (!(req.session.userId && req.session.displayName)) {
    res.status(401).json({
      error: "Du er ikke logget inn",
    });
    return;
  }

  const userId = req.session.userId;

  // If no parameters are provided, fetch all listings
  const reports = await database.getAllReports();
  res.json(reports);
});

// Endpoint for creating new listing
app.post("/", async (req, res) => {
  if (!(req.session.userId && req.session.displayName)) {
    res.status(401).json({
      error: "Du er ikke logget inn",
    });
    return;
  }

  const { reportedUserId, description } = req.body;
  const userId = req.session.userId;

  if (!(reportedUserId && description)) {
    res.status(400).json({ error: "Et nødvendig felt er ikke fylt ut" });
    return;
  }

  const status = await database.addReport(userId, reportedUserId, description);

  if (status === constants.SUCCESS) {
    res.status(201).send("Opprettet ny rapport for bruker");
  } else if (status === constants.INVALID_DESCRIPTION) {
    res.status(400).json({ error: "Ugyldig beskrivelse" });
  } else {
    res.status(500).json({ error: status /* "Det oppsto en feil" */ });
  }
});

// Endpoint for removing a listing
app.delete("/", async (req, res) => {
  // TODO: Check that user is logged in as admin
  if (!(req.session.userId && req.session.displayName)) {
    res.status(401).json({
      error: "Du er ikke logget inn",
    });
    return;
  }

  const { reportId } = req.body;
  const userId = req.session.userId;

  if (!(reportId && userId)) {
    res.status(400).json({ error: "Mangler rapportnr" });
    return;
  }

  const status = await database.removeReport(reportId);

  if (status === constants.SUCCESS) {
    res.status(200).send("Slettet rapport med id " + reportId);
  } else if (status === constants.DOES_NOT_EXIST) {
    res.status(400).json({ error: "Rapporten finnes ikke" });
  } else if (status === constants.INVALID_TYPE) {
    res.status(400).json({ error: "Ugyldig format" });
  } else {
    res.status(500).json({ error: "Det oppsto en feil" });
  }
});

module.exports = app;
