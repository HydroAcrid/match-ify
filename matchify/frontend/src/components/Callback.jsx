import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithCustomToken } from 'firebase/auth';

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
              .then(() => {
                navigate('/matching'); // Redirect to Matching page
              })
              .catch((error) => {
                console.error('Firebase sign-in error:', error);
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

  return (
    <div className="flex justify-center items-center h-screen">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );
  
};

export default Callback;
