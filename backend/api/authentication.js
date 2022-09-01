const express = require("express");
const User = require("../models/User");
const DatabaseAPI = require("../services/mongodb-framework");
const constants = require("../services/database-constants");

const app = express.Router();

const database = new DatabaseAPI();

// Endpoint for creating a new user
app.post("/register", async (req, res) => {
  const { email, displayName, password } = req.body;

  const result = await database.addUser(email, displayName, password);
  if (result === constants.SUCCESS) {
    const user = await database.getUser(email, password);

    req.session.userId = user._id;
    req.session.displayName = displayName;
    req.session.email = email;

    res.send("Opprettet bruker med e-postadresse " + email);
  } else if (result === constants.INVALID_EMAIL) {
    res.status(400).json({ error: "E-postadressen er ugyldig" });
  } else if (result === constants.INVALID_DISPLAYNAME) {
    res.status(400).json({ error: "Visningsnavnet er ugyldig" });
  } else if (result === constants.INVALID_PASSWORD) {
    res.status(400).json({ error: "Passordet er ugyldig" });
  } else if (result === constants.INVALID_TYPE) {
    res.status(400).json({ error: "Ugyldig data" });
  } else if (result === constants.FAILED) {
    res.status(400).json({ error: "E-postadressen er allerede i bruk" });
  } else {
    res.status(500).json({ error: "Det oppsto en feil" });
  }
});

// Endpoint for logging in
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const con = await database.connect();
  if (con != constants.SUCCESS) {
    res.status(500).json({ error: "Kunne ikke koble til database" });
    return;
  }
  let isAdmin = false;
  const user = await database.getUser(email, password);
  if (user instanceof User && user.email == constants.adminEmail) {
    isAdmin = true;
  }

  if (user instanceof User && user.isBanned != true) {
    const { displayName, _id: userId } = user;
    req.session.userId = userId;
    req.session.displayName = displayName;
    req.session.isAdmin = isAdmin;
    if (user instanceof User) {
      const { displayName, _id: userId, email } = user;
      req.session.userId = userId;
      req.session.displayName = displayName;
      req.session.email = email;
    }

    const greeting = "Velkommen " + displayName + "!";
    res.send(greeting);
  } else if (user.isBanned === true) {
    res.status(403).json({ error: "Brukeren din er blokkert" });
  } else if (user === constants.INVALID_TYPE) {
    res.status(400).json({ error: "E-post eller passord er av ugyldig type" });
  } else if (user === constants.INVALID_PASSWORD) {
    res.status(400).json({ error: "Feil passord" });
  } else if (user === constants.FAILED) {
    const retText =
      "Det finnes ingen bruker med denne e-postadressen. Registrer deg!";
    res.status(400).json({ error: retText });
  }
});

// Endpoint for logging out
app.get("/logout", (req, res) => {
  req.session.destroy();

  res.send("Du er nå logget ut");
});

// Endpoint for checking session and fetching userId
app.get("/check-session", (req, res) => {
  if (req.session.userId && req.session.displayName) {
    res.json({
      userId: req.session.userId,
      email: req.session.email,
      displayName: req.session.displayName,
      isAdmin: req.session.isAdmin,
    });
  } else {
    res.status(401).json({
      error: "Du er ikke logget inn",
    });
  }
});

module.exports = app;
