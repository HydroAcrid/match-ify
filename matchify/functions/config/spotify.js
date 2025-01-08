const SpotifyWebApi = require("spotify-web-api-node");
const { spotifyClientId, spotifyClientSecret } = require("./env");
const { isLocal } = require("./firebase");

// Decide the redirect URI
const redirectUri = isLocal
  ? "http://localhost:5173/callback"
  : "https://match-ify.netlify.app/callback";

/**
 * Creates a new instance of SpotifyWebApi configured with the environment secrets.
 * If you need to set the tokens (access/refresh) you can do so in the controllers.
 */
function createSpotifyApiInstance() {
  return new SpotifyWebApi({
    clientId: spotifyClientId.value(),
    clientSecret: spotifyClientSecret.value(),
    redirectUri,
  });
}

module.exports = { createSpotifyApiInstance, redirectUri };
