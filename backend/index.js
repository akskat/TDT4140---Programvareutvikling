const port = process.env.PORT || 3001;

// Imports
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const constants = require("./services/database-constants");
const DatabaseAPI = require("./services/mongodb-framework");
const { exit } = require("process");

const database = new DatabaseAPI();

// Initialization
const app = express();
app.use(express.static("react-build"));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "secretkey",
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 },
    resave: false,
  })
);

connectToDatabase();

async function connectToDatabase() {
  const ret = await database.connect();

  if (ret != constants.SUCCESS) {
    console.log("Klarte ikke å koble til databasen");
    exit();
  }

  console.log("Nå koblet til databasen");
}

// Welcome route
app.get("/api/", (req, res) => {
  res.send("Velkommen til LettBillett sitt API!");
});

// Routes for authentication handling (login, signup etc.)
app.use("/api/authentication", require("./api/authentication"));

// Routes for managing listings (add/delete listings, get listings etc.)
app.use("/api/listings", require("./api/listings"));

// Routes for reporting users
app.use("/api/reports", require("./api/reports"));

// Routes for rating users and fetching ratings
app.use("/api/ratings", require("./api/ratings"));

// Routes for managing admin funcitons
app.use("/api/admin", require("./api/admin"));

// Redirect other routes to index.html to let React handle routing
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "react-build", "index.html"));
});

// Listen for requests
const server = app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

async function powerOff() {
  console.log("Serveren skrur seg av");
  await database.disconnect();
  server.close();
}

process.on("SIGINT", async () => {
  await powerOff();
});

process.on("SIGTERM", async () => {
  await powerOff();
});
