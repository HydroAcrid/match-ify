import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithCustomToken } from 'firebase/auth';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
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
            // If response is not ok (status code not in 200-299 range)
            // Attempt to parse the error message from the response
            let errorMessage = 'Authentication failed';
            try {
              const errorData = await res.json();
              errorMessage = errorData.error || errorMessage;
            } catch (parseError) {
              // If parsing fails, use the default error message
              console.error('Error parsing error response:', parseError);
            }
            throw new Error(errorMessage);
          }
          // If response is ok, parse it as JSON
          return res.json();
        })
        .then((data) => {
          const { firebaseToken } = data;

          // Sign in to Firebase with the custom token
          signInWithCustomToken(auth, firebaseToken)
            .then((userCredential) => {
              // User is signed in
              console.log('User signed in:', userCredential.user);
              navigate('/setup'); // Redirect to setup page to set email and password
            })
            .catch((error) => {
              console.error('Firebase sign-in error:', error);
            });
        })
        .catch((error) => {
          console.error('Error:', error.message);
          // Optionally display an error message to the user
        });
    }
  }, [navigate]);

  return <div>Loading...</div>;
};

export default Callback;
