const express = require("express");
const router = express.Router();
const { handleSpotifyAuth, getUserTopArtists, searchArtists } = require("../controllers/spotifyController");
const authenticate = require("../middlewares/authenticate");

// Root route for sanity check
router.get("/", (req, res) => res.send("Spotify route is live"));

// Spotify auth callback
router.post("/auth", handleSpotifyAuth);

// Protected routes
router.get("/top-artists", authenticate, getUserTopArtists);
router.get("/search/artists", authenticate, searchArtists);

module.exports = router;
