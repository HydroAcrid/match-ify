import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Callback from './components/Callback';
import Setup from './components/Setup';
import Login from './components/Login';
import TopFivePage from './components/TopFivePage';
import MatchPage from './components/MatchPage';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Matching from './components/Matching';
import 'daisyui/dist/full.css';

function App() {
  const clientId = '9e5b80440e6445cebafa8377987336e6';
  const redirectUri = 'http://localhost:5173/callback'; // Your redirect URI
  const scopes = 'user-top-read user-read-email user-read-private';

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return (
    <div data-theme="spotify">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
                <h1 className="text-5xl font-bold mb-6">Welcome to Matchify</h1>
                <a href={authUrl}>
                  <button className="btn btn-primary">Login with Spotify</button>
                </a>
              </div>
            }
          />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/matching"
            element={
              <PrivateRoute>
                <Matching />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
