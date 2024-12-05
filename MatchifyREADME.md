# Matchify

## Team Members:
Kevin Dotel, Aditi Sathe, Leif Freed

### Description 
Matchify is a web-based application that helps you find your most compatible Spotify users! It operates by first requesting that users put in their top five favorite artists, and then view their top five most compatible people on Spotify based on who they listen to the most. 

### Pages 
1. Landing Page - requests you log in with your Spotify credential
2. Top Five Page - page to enter in your top five most listened to artists
3. Admin Page (only accessible to certain users)  - if your user role is an admin, you can view the usage analytics of Matchify
4. Matching Page - shows you your matches!

## Features

- **Spotify Integration:** Users can log in with their Spotify accounts, enabling Matchify to fetch their top artists, tracks, and genres.
- **Compatibility Scoring:** Matchify calculates compatibility scores using advanced metrics, including shared artists, genre overlap, and audio feature similarity (e.g., danceability, energy, and tempo).
- **Dynamic Matching:** Users can view their top 5 most compatible matches, complete with a breakdown of shared preferences and a compatibility percentage.
- **Interactive UI:** Designed with React and styled with DaisyUI and TailwindCSS for a modern and intuitive user experience.

---

## Setup and Installation

### Prerequisites
1. **Node.js**: Install Node.js (v16 or later) from [Node.js Downloads](https://nodejs.org/).
2. **Firebase Tools**: Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
3. **Spotify Developer Account**: Sign up at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) and create a new app.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-repo>/matchify.git
   cd matchify
   ```
2. Install dependencies for the frontend and backend:
   ```bash
   npm install
   cd functions
   npm install
   cd ..
   ```

### Configuration

#### Firebase Setup
1. Initialize Firebase in your project directory:
   ```bash
   firebase init
   ```
2. Configure the following Firebase services:
   - **Authentication**: Enable email/password authentication.
   - **Firestore**: Set up a Firestore database with security rules.
   - **Hosting**: Use Firebase Hosting for deployment.
3. Place your Firebase Admin SDK service account key JSON file in the `functions` directory and update the path in `index.js`:
   ```javascript
   const serviceAccountPath = path.resolve(__dirname, '../your-service-account.json');
   ```

#### Spotify API Setup
1. In your Spotify Developer Dashboard, note the following credentials:
   - **Client ID**
   - **Client Secret**
   - **Redirect URI** (e.g., `http://localhost:5173/callback` for local testing)
2. Update your `.env` file with the Spotify credentials:
   ```plaintext
   SPOTIFY_CLIENT_ID=<your-client-id>
   SPOTIFY_CLIENT_SECRET=<your-client-secret>
   ```

---

## Running the Application

### Local Development
1. Start the Firebase emulator for the backend:
   ```bash
   firebase emulators:start
   ```
2. Start the React frontend:
   ```bash
   npm start
   ```
3. Open your browser to `http://localhost:5173`.

### Deployment
1. Build the frontend for production:
   ```bash
   npm run build
   ```
2. Deploy to Firebase Hosting:
   ```bash
   firebase deploy
   ```

---

## Dependencies

### Backend
- **Firebase Functions**: Used to handle API endpoints and user authentication.
- **Spotify Web API Node**: Node.js client for interacting with the Spotify API.
- **Firebase Admin SDK**: For database operations and creating custom authentication tokens.

### Frontend
- **React**: Core frontend framework.
- **TailwindCSS & DaisyUI**: For styling and UI components.
- **React Router**: For navigation.

---

## API Keys and Databases

### Required API Keys
- **Spotify API Keys**: 
  - `SPOTIFY_CLIENT_ID`
  - `SPOTIFY_CLIENT_SECRET`
- **Firebase Admin SDK**: JSON key file for Firebase project.

### Databases
- **Firestore Database**:
  - Collections:
    - `users`: Stores user data, including Spotify preferences and compatibility metrics.

---

## Known Issues and Future Improvements

### Known Issues
- **Spotify Developer Mode:** Users must be added manually to the Spotify app's dashboard during development.
- **Rate Limits:** Heavy usage may trigger Spotify's rate-limiting.

### Future Features
- **Enhanced Matching Algorithms:** Include time of day and listening session data for deeper insights.
- **Group Recommendations:** Suggest music or playlists for groups based on shared preferences.

---

