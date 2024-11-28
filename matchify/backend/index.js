const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Matchify Backend API'));

// Firebase stuff 
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Example endpoint to add a user
app.post('/addUser', async (req, res) => {
  try {
    const user = req.body;
    await db.collection('users').add(user);
    res.status(200).send('User added');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
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


