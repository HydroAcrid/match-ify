const path = require("path");
// const dotenv = require('dotenv');
const {onRequest} = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const SpotifyWebApi = require("spotify-web-api-node");
const {initializeApp, cert} = require("firebase-admin/app"); // Import cert function
const {getAuth} = require("firebase-admin/auth");
const {getFirestore} = require("firebase-admin/firestore");
const {defineSecret} = require("firebase-functions/params");

// Chck if running in emulator
const isLocal = !!process.env.FUNCTIONS_EMULATOR;  // 'true' if running in emulator

// Load environment variables from .env file
// dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Correct

if (isLocal) {
  // Load service account JSON for local development
  const serviceAccountPath = path.resolve(__dirname, '../ked225-firebase-adminsdk-twon8-d3560c296d.json');
  initializeApp({
    credential: cert(require(serviceAccountPath)),
  });
} else {
  // In production, rely on default credentials provided by Cloud Functions
  initializeApp();
}

const db = getFirestore();
const auth = getAuth();

// Access Spotify credentials from environment variables
// const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
// const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

// Establish secret for spotify client id and secret
const spotifyClientId = defineSecret("SPOTIFY_CLIENT_ID");
const spotifyClientSecret = defineSecret("SPOTIFY_CLIENT_SECRET");

// Base which redirectURI to use on local or prod
const redirectUri = isLocal
  ? 'http://localhost:5173/callback'
  : 'https://match-ify.netlify.app/callback';


// const redirectUri = 'http://localhost:5173/callback';

// NEW REDIRECT URI
// const redirectUri = "https://match-ify.netlify.app/callback"; // Replace with your actual Netlify URL


console.log("Spotify Client ID:", spotifyClientId);
console.log("Spotify Client Secret:",
  spotifyClientSecret ? "Loaded" : "Not Loaded");

// Initialize Express app
const app = express();

// Automatically allow cross-origin requests
// app.use(cors({origin: "https://match-ify.netlify.app"}));

// Allow specific origins
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://match-ify.netlify.app"
  ]
}));


// Parse JSON bodies
app.use(express.json());

// Authenticate user middleware
const authenticate = require("./utils/authenticate");

// Debugging stuff:
console.log("FUNCTIONS_EMULATOR:", process.env.FUNCTIONS_EMULATOR);
console.log("isLocal:", isLocal);
console.log("redirectUri in use:", redirectUri);

// Routes

// Root route
app.get("/", (req, res) => res.send("Matchify Backend API"));

// Endpoint to handle Spotify auth callback
app.post("/spotify/auth", async (req, res) => {
  try {
    const {code} = req.body;
    console.log("Authorization code received in backend:", code);

    // Validate input
    if (!code) {
      return res.status(400).json({
        error: "Authentication failed",
        details: "No authorization code provided",
      });
    }

    // const spotifyApi = new SpotifyWebApi({
    //   clientId: spotifyClientId,
    //   clientSecret: spotifyClientSecret,
    //   redirectUri: redirectUri,
    // });

    // NEW PROD ONE
    const spotifyApi = new SpotifyWebApi({
      clientId: spotifyClientId.value(),
      clientSecret: spotifyClientSecret.value(),
      redirectUri: redirectUri,
    });


    try {
      // Exchange authorization code for tokens
      const data = await spotifyApi.authorizationCodeGrant(code);
      console.log("Token exchange response:", {
        access_token: "****", // Mask sensitive information
        token_type: data.body.token_type,
        expires_in: data.body.expires_in,
        scope: data.body.scope,
      });

      const {access_token: accessToken,
        refresh_token: refreshToken} = data.body;
      spotifyApi.setAccessToken(accessToken);

      // Fetch user profile
      let userProfile;
      try {
        userProfile = await spotifyApi.getMe();
      } catch (profileError) {
        console.error("Error fetching Spotify profile:",
            JSON.stringify(profileError, null, 2));
        console.error("Error status code:",
            profileError.statusCode);
        console.error("Error body:",
            JSON.stringify(profileError.body, null, 2));
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
        firebaseToken = await auth.createCustomToken(spotifyId, {spotifyId});
        console.log("Generated Firebase Token:", firebaseToken);
      } catch (tokenError) {
        console.error("Error creating Firebase token:", tokenError);
        return res.status(500).json({
          error: "Token creation failed",
          details: tokenError.message,
        });
      }

      // Save the user data and tokens in Firestore
      try {
        await db.collection("users").doc(spotifyId).set(
            {
              email,
              spotifyAccessToken: accessToken,
              spotifyRefreshToken: refreshToken,
              displayName,
              photoURL,
              lastAuthenticated: new Date(),
            },
            {merge: true},
        );
      } catch (firestoreError) {
        console.error("Error saving user to Firestore:", firestoreError);
        return res.status(500).json({
          error: "User storage failed",
          details: firestoreError.message,
        });
      }

      res.status(200).json({
        firebaseToken,
        userId: spotifyId,
      });
    } catch (exchangeError) {
      console.error("Token Exchange Error:", {
        message: exchangeError.message,
        responseData: exchangeError.response?.data,
        stack: exchangeError.stack,
      });

      // More specific error handling
      if (exchangeError.message.includes("invalid_grant")) {
        return res.status(400).json({
          error: "Authentication failed",
          details: "Invalid or expired authorization code",
        });
      }

      res.status(400).json({
        error: "Authentication failed",
        details: exchangeError.message || "Invalid authorization code",
      });
    }
  } catch (error) {
    console.error("Overall Auth Error:", error);
    res.status(500).json({
      error: "Server error during authentication",
      details: error.message,
    });
  }
});

// Endpoint to get user's top artists (requires authentication)
app.get("/api/user/top-artists", authenticate, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).send("User not found");
    }

    const {spotifyAccessToken, spotifyRefreshToken} = userDoc.data();

    // Create a new SpotifyWebApi instance for this request
    const spotifyApi = new SpotifyWebApi({
      clientId: spotifyClientId,
      clientSecret: spotifyClientSecret,
    });

    // Set tokens on spotifyApi instance
    spotifyApi.setAccessToken(spotifyAccessToken);
    spotifyApi.setRefreshToken(spotifyRefreshToken);

    // Attempt to get user's top artists
    try {
      const response = await spotifyApi.getMyTopArtists();
      res.status(200).json(response.body);
    } catch (error) {
      if (error.statusCode === 401) {
        // Access token expired, refresh it
        await refreshAccessToken(uid, spotifyApi);
        // Retry the request
        const response = await spotifyApi.getMyTopArtists();
        res.status(200).json(response.body);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error fetching top artists:", error.message);
    res.status(500).send("Failed to fetch top artists");
  }
});

// Endpoint to search for artists
app.get("/api/search/artists", authenticate, async (req, res) => {
  try {
    const {query} = req.query;

    if (!query) {
      return res.status(400).json({error: "Missing search query"});
    }

    const uid = req.user.uid;
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found"});
    }

    const {spotifyAccessToken, spotifyRefreshToken} = userDoc.data();

    const spotifyApi = new SpotifyWebApi({
      clientId: spotifyClientId,
      clientSecret: spotifyClientSecret,
    });

    spotifyApi.setAccessToken(spotifyAccessToken);
    spotifyApi.setRefreshToken(spotifyRefreshToken);

    try {
      // Search for artists
      const response = await spotifyApi.searchArtists(query, {limit: 5});
      res.status(200).json(response.body.artists.items);
    } catch (error) {
      if (error.statusCode === 401) {
        // Access token expired, refresh it
        await refreshAccessToken(uid, spotifyApi);
        // Retry the request
        const response = await spotifyApi.searchArtists(query, {limit: 5});
        res.status(200).json(response.body.artists.items);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error searching for artists:", error);
    res.status(500).json({error: "Failed to search for artists"});
  }
});


/**
 * Refreshes the user access token.
 * @param {*} userId - ID of the user
 * @param {*} spotifyApi - Api spotify
 * @return {number} - a new access token.
 */
async function refreshAccessToken(userId, spotifyApi) {
  try {
    // Retrieve the refresh token from Firestore
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new Error("User not found");
    }
    const {spotifyRefreshToken} = userDoc.data();

    // Set the refresh token on the spotifyApi instance
    spotifyApi.setRefreshToken(spotifyRefreshToken);

    // Refresh the access token
    const data = await spotifyApi.refreshAccessToken();
    const newAccessToken = data.body.access_token;

    // Update the access token in Firestore
    await db.collection("users").doc(userId).update({
      spotifyAccessToken: newAccessToken,
    });

    // Update the access token on the spotifyApi instance
    spotifyApi.setAccessToken(newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error.message);
    throw error;
  }
}

// Export the Express app as a Firebase Function with secrets
// exports.api = onRequest(app);

exports.api = onRequest(
    {
      secrets: [spotifyClientId, spotifyClientSecret],
    },
    app,
);

