import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Callback from './components/Callback';
import Setup from './components/Setup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const clientId = '9e5b80440e6445cebafa8377987336e6';
  const redirectUri = 'http://localhost:5173/callback'; // Your redirect URI
  const scopes = 'user-top-read user-read-email user-read-private';

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <h1>Welcome to Matchify</h1>
              <a href={authUrl}>
                <button>Login with Spotify</button>
              </a>
              <p>or</p>
              <a href="/login">
                <button>Login with Email</button>
              </a>
            </div>
          }
        />
        <Route path="/callback" element={<Callback />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }/>
          <Route path = "/top-five" element={< TopFivePage />} />

      </Routes>
    </Router>
  );
}

export default App;
