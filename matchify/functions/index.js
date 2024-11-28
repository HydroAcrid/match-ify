const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { onRequest } = require('firebase-functions/v2/https');
const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require('axios');


// Initialize Firebase Admin
initializeApp({
  credential: cert(require('../ked225-firebase-adminsdk-twon8-d3560c296d.json')),
});

const db = getFirestore();
const auth = getAuth();

// Access Spotify credentials from environment variables
const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = 'http://localhost:5173/callback';

console.log('Spotify Client ID:', spotifyClientId);

// Initialize Express app
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Parse JSON bodies
app.use(express.json());

// Authenticate user middleware
const authenticate = require('./utils/authenticate');

// Routes

// Root route
app.get('/', (req, res) => res.send('Matchify Backend API'));

// Endpoint to handle Spotify auth callback
app.post('/spotify/auth', async (req, res) => {
  try {
    const { code } = req.body;
    console.log('Authorization code received in backend:', code);

    const spotifyApi = new SpotifyWebApi({
      clientId: spotifyClientId,
      clientSecret: spotifyClientSecret,
      redirectUri: redirectUri,
    });

    // Exchange authorization code for tokens
    const data = await spotifyApi.authorizationCodeGrant(code);
    console.log('Token exchange response:', data.body);

    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);

    // Fetch user profile using spotify-web-api-node
    const userProfile = await spotifyApi.getMe();
    const spotifyId = userProfile.body.id;
    const email = userProfile.body.email;

    // Create a Firebase custom token
    const firebaseToken = await auth.createCustomToken(spotifyId, { spotifyId });

    // Save the user data and tokens in Firestore
    await db.collection('users').doc(spotifyId).set(
      {
        email,
        spotifyAccessToken: access_token,
        spotifyRefreshToken: refresh_token,
        displayName: userProfile.body.display_name,
      },
      { merge: true }
    );

    res.status(200).json({ firebaseToken });
  } catch (error) {
    console.error('Error during Spotify auth:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Authentication failed',
      details: error.response?.data || error.message,
    });
  }
});

// Endpoint to get user's top artists (requires authentication)
app.get('/api/user/top-artists', authenticate, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    const { spotifyAccessToken, spotifyRefreshToken } = userDoc.data();

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
    console.error('Error fetching top artists:', error.message);
    res.status(500).send('Failed to fetch top artists');
  }
});



async function refreshAccessToken(userId, spotifyApi) {
  try {
    // Retrieve the refresh token from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    const { spotifyRefreshToken } = userDoc.data();

    // Set the refresh token on the spotifyApi instance
    spotifyApi.setRefreshToken(spotifyRefreshToken);

    // Refresh the access token
    const data = await spotifyApi.refreshAccessToken();
    const newAccessToken = data.body.access_token;

    // Update the access token in Firestore
    await db.collection('users').doc(userId).update({
      spotifyAccessToken: newAccessToken,
    });

    // Update the access token on the spotifyApi instance
    spotifyApi.setAccessToken(newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error('Error refreshing access token:', error.message);
    throw error;
  }
}



// Export the Express app as a Firebase Function with secrets
exports.api = onRequest(app);

