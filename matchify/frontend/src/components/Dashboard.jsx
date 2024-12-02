import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import HeartsCanvas from './HeartsCanvas'; // Import the HeartsCanvas component
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/'));
  };

  const handleChangeTop5 = () => {
    navigate('/matching');
  };

  const handleMeetMatches = () => {
    navigate('/compatibility');
  };

  const home = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth.currentUser.uid;
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setIsAdmin(data.admin === true);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (auth.currentUser) {
      fetchUserData();
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
        <HeartsCanvas />
      <div className="navbar bg-base-100 shadow relative z-10">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl" onClick={home}>Matchify</a>
        </div>
        <div className="flex-none">
          <button className="btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      {isAdmin && (
          <div className="flex justify-center mt-4 relative z-10">
            <Link to="/admin">
              <button className="btn btn-secondary">Go to Admin Page</button>
            </Link>
          </div>
        )}
      <div className="container mx-auto py-8 relative z-10">
        {userData ? (
          <div className="card w-full max-w-md bg-base-100 shadow-xl mx-auto border border-primary rounded-lg">
            <div className="card-body items-center text-center">
              {userData.photoURL && (
                <img
                  src={userData.photoURL}
                  alt="Profile"
                  className="rounded-full w-24 h-24 mb-4"
                />
              )}
              <h2 className="card-title">
                Welcome, {userData.displayName || 'User'}!
              </h2>
              <h3 className="text-xl mt-4">Your Favorite Artists:</h3>
              {userData.favoriteArtists ? (
                <div>
                  <ul>
                    {userData.favoriteArtists.map((artist) => (
                      <li key={artist.id}>{artist.name}</li>
                    ))}
                  </ul>
                  <button
                    className="btn btn-sm btn-secondary mt-4"
                    onClick={handleChangeTop5}
                  >
                    Change Your Top 5 Artists
                  </button>
                </div>
              ) : (
                <p>You haven't selected any favorite artists yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <button className="btn loading">Loading...</button>
          </div>
        )}
        <div className="flex justify-center mt-8">
          <button
            className="btn btn-primary"
            onClick={handleMeetMatches}
          >
            Meet your matches 💖
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
