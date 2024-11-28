// Callback.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithCustomToken } from 'firebase/auth';

const Callback = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false); // Prevent multiple executions

  useEffect(() => {
    if (hasFetched.current) {
      return; // Exit if already fetched
    }
    hasFetched.current = true; // Mark as fetched

    const code = new URLSearchParams(window.location.search).get('code');
    console.log('Authorization code received in frontend:', code);

    if (code) {
      // Exchange the code for tokens
      fetch('http://localhost:5001/ked225/us-central1/api/spotify/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then(async (res) => {
          if (!res.ok) {
            let errorMessage = 'Authentication failed';
            try {
              const errorData = await res.json();
              errorMessage = errorData.details || errorMessage;

              // Specifically handle authorization code expiration
              if (errorMessage.includes('Authorization code expired')) {
                alert('Login session expired. Please login again.');
                window.location.href = '/'; // Redirect to home/login page
                return null;
              }

              // Handle invalid grant errors
              if (errorMessage.includes('invalid_grant')) {
                alert('Invalid login. Please try again.');
                window.location.href = '/';
                return null;
              }
            } catch (parseError) {
              console.error('Error parsing error response:', parseError);
            }
            throw new Error(errorMessage);
          }
          return res.json();
        })
        .then((data) => {
          if (data) {
            const { firebaseToken } = data;

            signInWithCustomToken(auth, firebaseToken)
              .then((userCredential) => {
                console.log('User signed in:', userCredential.user);
                navigate('/setup');
              })
              .catch((error) => {
                console.error('Firebase sign-in error:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                alert(`Firebase sign-in error: ${error.message}`);
                window.location.href = '/';
              });
          }
        })
        .catch((error) => {
          console.error('Authentication Error:', error.message);
          alert(error.message);
          window.location.href = '/';
        });
    }
  }, [navigate]);

  return <div>Loading authentication...</div>;
};

export default Callback;
