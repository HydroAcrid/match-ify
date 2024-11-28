// Import necessary modules
const functions = require('firebase-functions');
const { defineSecret } = require('firebase-functions/params');
const { onRequest } = require('firebase-functions/v2/https');
const { onInit } = require('firebase-functions/v2/core');
const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Define secrets using parameterized configuration
const spotifyClientId = defineSecret('SPOTIFY_CLIENT_ID');
const spotifyClientSecret = defineSecret('SPOTIFY_CLIENT_SECRET');

// Initialize Express app
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Parse JSON bodies
app.use(express.json());

// Firestore database
const db = admin.firestore();

// Global variable for Spotify API
let spotifyApi;

// Use onInit to initialize spotifyApi with secrets
onInit(() => {
  spotifyApi = new SpotifyWebApi({
    clientId: spotifyClientId.value(),
    clientSecret: spotifyClientSecret.value(),
  });
});

// Routes
app.get('/', (req, res) => res.send('Matchify Backend API'));

app.post('/addUser', async (req, res) => {
  try {
    const user = req.body;
    await db.collection('users').add(user);
    res.status(200).send('User added');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/artists/:name', async (req, res) => {
  try {
    const { body: token } = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(token.access_token);

    const { body } = await spotifyApi.searchArtists(req.params.name);
    res.status(200).json(body.artists.items);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Export the Express app as a Firebase Function with secrets
exports.api = onRequest(
  {
    secrets: [spotifyClientId, spotifyClientSecret],
  },
  app
);
