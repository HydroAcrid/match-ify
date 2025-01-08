const { defineSecret } = require("firebase-functions/params");

// Define the secrets for Spotify credentials
const spotifyClientId = defineSecret("SPOTIFY_CLIENT_ID");
const spotifyClientSecret = defineSecret("SPOTIFY_CLIENT_SECRET");

module.exports = { spotifyClientId, spotifyClientSecret };
