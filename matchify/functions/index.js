const express = require("express");
const cors = require("cors");
const { onRequest } = require("firebase-functions/v2/https");

const routes = require("./routes");
const { spotifyClientId, spotifyClientSecret } = require("./config/env");

// Create Express app
const app = express();

// Allow cross-origin
app.use(cors({
  origin: ["http://localhost:5173", "https://match-ify.netlify.app"]
}));

// Parse JSON
app.use(express.json());

// Attach main router
app.use("/", routes);

// Export as Firebase Function with secrets
exports.api = onRequest(
  {
    secrets: [spotifyClientId, spotifyClientSecret],
  },
  app
);
