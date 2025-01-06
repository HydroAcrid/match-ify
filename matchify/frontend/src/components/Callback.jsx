// Callback.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { API_BASE_URL } from '../config';


const Callback = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) {
      return;
    }
    hasFetched.current = true;

    const code = new URLSearchParams(window.location.search).get('code');
    console.log('Authorization code received in frontend:', code);

    if (code) {
      // Exchange the code for tokens
      fetch(`${API_BASE_URL}/spotify/auth`, {
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
              .then(async () => {
                // After signing in, check if the user has favorite artists
                const uid = auth.currentUser.uid;
                const userDocRef = doc(db, 'users', uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                  const userData = userDocSnap.data();
                  if (
                    userData.favoriteArtists &&
                    userData.favoriteArtists.length === 5
                  ) {
                    // User has favorite artists, redirect to dashboard
                    navigate('/dashboard');
                  } else {
                    // User does not have favorite artists, redirect to matching
                    navigate('/matching');
                  }
                } else {
                  // If user document doesn't exist, navigate to matching
                  navigate('/matching');
                }
              })
              .catch((error) => {
                console.error('Firebase sign-in error:', error);
                alert(`Firebase sign-in error: ${error.message}`);
                window.location.href = '/';
              });
          }
        })
        .catch((error) => {
          console.error('Authentication Error:', error);
          const errorMessage = error.response?.data?.details || error.message || JSON.stringify(error);
          alert(`Authentication Error: ${errorMessage}`);
          window.location.href = '/';
        });        
    }
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );
};

export default Callback;
