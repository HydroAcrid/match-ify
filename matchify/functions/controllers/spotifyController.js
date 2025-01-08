const { db, auth } = require("../config/firebase");
const { createSpotifyApiInstance } = require("../config/spotify");
const refreshAccessToken = require("../utils/refreshAccessToken");

// Handle the Spotify auth callback
exports.handleSpotifyAuth = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({
        error: "Authentication failed",
        details: "No authorization code provided",
      });
    }

    const spotifyApi = createSpotifyApiInstance();
    const data = await spotifyApi.authorizationCodeGrant(code);

    const { access_token: accessToken, refresh_token: refreshToken } = data.body;
    spotifyApi.setAccessToken(accessToken);

    // Fetch user profile from Spotify
    let userProfile;
    try {
      userProfile = await spotifyApi.getMe();
    } catch (profileError) {
      console.error("Error fetching Spotify profile:", profileError);
      return res.status(500).json({
        error: "Profile retrieval failed",
        details: profileError.message || profileError,
      });
    }

    const spotifyId = userProfile.body.id;
    const email = userProfile.body.email;
    const displayName = userProfile.body.display_name;
    const photoURL = userProfile.body.images?.[0]?.url || null;

    // Create a Firebase custom token
    let firebaseToken;
    try {
      firebaseToken = await auth.createCustomToken(spotifyId, { spotifyId });
      console.log("Generated Firebase Token:", firebaseToken);
    } catch (tokenError) {
      console.error("Error creating Firebase token:", tokenError);
      return res.status(500).json({
        error: "Token creation failed",
        details: tokenError.message,
      });
    }

    // Save user data in Firestore
    try {
      await db.collection("users").doc(spotifyId).set({
        email,
        spotifyAccessToken: accessToken,
        spotifyRefreshToken: refreshToken,
        displayName,
        photoURL,
        lastAuthenticated: new Date(),
      }, { merge: true });
    } catch (firestoreError) {
      console.error("Error saving user to Firestore:", firestoreError);
      return res.status(500).json({
        error: "User storage failed",
        details: firestoreError.message,
      });
    }

    return res.status(200).json({
      firebaseToken,
      userId: spotifyId,
    });
  } catch (exchangeError) {
    console.error("Token Exchange Error:", exchangeError);
    if (exchangeError.message?.includes("invalid_grant")) {
      return res.status(400).json({
        error: "Authentication failed",
        details: "Invalid or expired authorization code",
      });
    }
    return res.status(400).json({
      error: "Authentication failed",
      details: exchangeError.message || "Invalid authorization code",
    });
  }
};

// Get user's top artists
exports.getUserTopArtists = async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).send("User not found");
    }

    const { spotifyAccessToken, spotifyRefreshToken } = userDoc.data();
    const spotifyApi = createSpotifyApiInstance();

    // Overwrite tokens
    spotifyApi.setAccessToken(spotifyAccessToken);
    spotifyApi.setRefreshToken(spotifyRefreshToken);

    try {
      const response = await spotifyApi.getMyTopArtists();
      res.status(200).json(response.body);
    } catch (error) {
      if (error.statusCode === 401) {
        // Access token expired, refresh it
        await refreshAccessToken(uid, spotifyApi, db);
        // Retry
        const response = await spotifyApi.getMyTopArtists();
        return res.status(200).json(response.body);
      }
      throw error;
    }
  } catch (error) {
    console.error("Error fetching top artists:", error.message);
    res.status(500).send("Failed to fetch top artists");
  }
};

// Search for artists
exports.searchArtists = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Missing search query" });
    }

    const uid = req.user.uid;
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const { spotifyAccessToken, spotifyRefreshToken } = userDoc.data();
    const spotifyApi = createSpotifyApiInstance();
    spotifyApi.setAccessToken(spotifyAccessToken);
    spotifyApi.setRefreshToken(spotifyRefreshToken);

    try {
      const response = await spotifyApi.searchArtists(query, { limit: 5 });
      return res.status(200).json(response.body.artists.items);
    } catch (error) {
      if (error.statusCode === 401) {
        await refreshAccessToken(uid, spotifyApi, db);
        const response = await spotifyApi.searchArtists(query, { limit: 5 });
        return res.status(200).json(response.body.artists.items);
      }
      throw error;
    }
  } catch (error) {
    console.error("Error searching for artists:", error);
    res.status(500).json({ error: "Failed to search for artists" });
  }
};
