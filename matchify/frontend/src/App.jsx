// App.jsx
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
import Compatibility from './components/Compatibility'; // Import Compatibility component
import 'daisyui/dist/full.css';
import AdminRoute from './components/AdminRoute'; // Import AdminRoute
import AdminPage from './components/AdminPage'; // Import AdminPage
import NotAuthorized from './components/NotAuthorized';

function App() {
  // Check if we're on the local frontend
  const isLocalFrontEnd = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const clientId = '9e5b80440e6445cebafa8377987336e6'; // Spotify client ID
  const localRedirectUri = 'http://localhost:5173/callback'; // Local redirect URI
  const prodRedirectUri = "https://match-ify.netlify.app/callback"; // PROD Netlify URL

  const redirectUri = isLocalFrontEnd ? localRedirectUri : prodRedirectUri;


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
          <Route
            path="/compatibility"
            element={
              <PrivateRoute>
                <Compatibility />
              </PrivateRoute>
            }
          />
          {/* Other routes */}
          <Route path="/top-five" element={<TopFivePage />} />
          <Route path="/match" element={<MatchPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="/not-authorized" element={<NotAuthorized />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
