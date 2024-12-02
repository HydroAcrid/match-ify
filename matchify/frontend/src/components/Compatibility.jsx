import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Compatibility = () => {
  const [compatibleUsers, setCompatibleUsers] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompatibleUsers = async () => {
      try {
        const uid = auth.currentUser.uid;
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);

        const allUsers = [];
        usersSnapshot.forEach((doc) => {
          allUsers.push({ id: doc.id, ...doc.data() });
        });

        // Find the current user's data
        const currentUser = allUsers.find((user) => user.id === uid);
        setCurrentUserData(currentUser);

        if (!currentUser || !currentUser.favoriteArtists) {
          console.error('Current user has no favorite artists selected.');
          return;
        }

        const otherUsers = allUsers.filter((user) => user.id !== uid);

        // Calculate compatibility
        const compatibilityResults = otherUsers.map((user) => {
          const sharedArtists = currentUser.favoriteArtists.filter((artist) =>
            user.favoriteArtists?.some((a) => a.id === artist.id)
          );

          const compatibilityPercentage = (sharedArtists.length / 5) * 100;

          return {
            id: user.id,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL || '',
            sharedArtists,
            compatibilityPercentage,
          };
        });

        // Sort users by compatibility percentage in descending order
        compatibilityResults.sort(
          (a, b) => b.compatibilityPercentage - a.compatibilityPercentage
        );

        // Get top 5 compatible users
        const topCompatibleUsers = compatibilityResults.slice(0, 5);

        setCompatibleUsers(topCompatibleUsers);
      } catch (error) {
        console.error('Error fetching compatible users:', error);
      }
    };

    fetchCompatibleUsers();
  }, []);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow">
        <div className="flex-1">
          <button
            className="btn btn-ghost normal-case text-xl"
            onClick={handleBackToDashboard}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">
          Your Top 5 Matches
        </h1>
        {compatibleUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {compatibleUsers.map((user) => (
              <div
                key={user.id}
                className="card bg-base-100 shadow-xl p-4 flex flex-col items-center"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="rounded-full w-24 h-24 mb-4"
                  />
                ) : (
                  <div className="rounded-full bg-gray-600 w-24 h-24 mb-4 flex items-center justify-center">
                    <span className="text-white text-3xl">
                      {user.displayName.charAt(0)}
                    </span>
                  </div>
                )}
                <h2 className="card-title">{user.displayName}</h2>
                <p className="text-sm">
                  Compatibility: {user.compatibilityPercentage}%
                </p>
                <h3 className="mt-2">Shared Favorite Artists:</h3>
                <ul>
                  {user.sharedArtists.map((artist) => (
                    <li key={artist.id}>{artist.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg">
            No compatible users found at the moment.
          </p>
        )}
      </div>
    </div>
  );
};

export default Compatibility;
