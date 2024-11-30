import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';

const Setup = () => {
  const [displayName, setDisplayName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Set the initial display name from the current user
    if (auth.currentUser && auth.currentUser.displayName) {
      setDisplayName(auth.currentUser.displayName);
    }
  }, []);

  const handleSetup = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;

      // Update the user's display name
      await updateProfile(user, { displayName });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <div className="card-body">
          <h2 className="card-title">Set Up Your Account</h2>
          <form onSubmit={handleSetup}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Display Name</span>
              </label>
              <input
                type="text"
                placeholder="Display Name"
                className="input input-bordered"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            {/* Add other preference fields here */}
            <div className="form-control mt-6">
              <button className="btn btn-primary" type="submit">
                Save and Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Setup;
