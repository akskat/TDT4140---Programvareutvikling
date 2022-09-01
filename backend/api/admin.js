const express = require("express");
const User = require("../models/User");
const DatabaseAPI = require("../services/mongodb-framework");
const constants = require("../services/database-constants");
const app = require("./authentication");

const database = new DatabaseAPI();

app.post("/block", async (req, res) => {
  if (!(req.session.userId && req.session.displayName)) {
    res.status(401).json({
      error: "Du er ikke logget inn",
    });
    return;
  }

  if (!req.session.isAdmin) {
    res.status(403).json({ error: "Du er ikke en admin" });
    return;
  }

  const { userEmail, toBlock } = req.body;

  if (!(userEmail && typeof toBlock == "boolean")) {
    res.status(400).json({ error: "Mangler brukerens email" });
    return;
  }

  const status = await database.adminSetBlock(
    req.session.userId,
    userEmail,
    toBlock
  );

  switch (status) {
    case constants.SUCCESS:
      res
        .status(201)
        .send("Oppdaterte brukerens blokkering, email: " + userEmail);
      const arr = await database.getAllReports();
      arr.forEach((report) => {
        if (report.reportedEmail == userEmail) {
          database.removeReport(report._id);
        }
      });
      break;
    case constants.INVALID_TYPE:
      res.status(400).json({ error: "Ugyldig data ble sendt in" });
      break;
    case constants.NOT_ADMIN:
      res.status(403).json({ error: "Du er ikke en admin" });
      break;
    case constants.DOES_NOT_EXIST:
      res.status(400).json({
        error: "Bruker med den gitte emailen finnes ikke: " + userEmail,
      });
      break;
    default:
      res.status(400).json({ error: "Det oppsto en ukjent feil" });
      break;
  }
});

module.exports = app;
