import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FaMusic } from 'react-icons/fa';

const Compatibility = () => {
  const [compatibleUsers, setCompatibleUsers] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
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

          const compatibilityPercentage = Math.min((sharedArtists.length / 5) * 100, 100);

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
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          Your Top 5 Matches
        </h1>
        {compatibleUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {compatibleUsers.map((user) => (
              <div
                key={user.id}
                className="card bg-base-100 shadow-xl p-6 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 cursor-pointer"
                onClick={() => setSelectedUser(user)}
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
                <div
                  className="radial-progress text-primary mt-2"
                  style={{
                    "--value": user.compatibilityPercentage,
                    "--size": "120px",
                    "--thickness": "8px",
                  }}
                >
                  {user.compatibilityPercentage}%
                </div>
                <h4 className="mt-4 text-md font-semibold flex items-center">
                  <FaMusic className="mr-2" /> Shared Favorite Artists:
                </h4>
                <ul className="list-disc list-inside text-sm">
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

      {/* Modal for Detailed Compatibility */}
      {selectedUser && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <label
              htmlFor="my-modal"
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setSelectedUser(null)}
            >
              ✕
            </label>
            <div className="flex flex-col items-center">
              {selectedUser.photoURL ? (
                <img
                  src={selectedUser.photoURL}
                  alt="Profile"
                  className="rounded-full w-24 h-24 mb-4"
                />
              ) : (
                <div className="rounded-full bg-gray-600 w-24 h-24 mb-4 flex items-center justify-center">
                  <span className="text-white text-3xl">
                    {selectedUser.displayName.charAt(0)}
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold">{selectedUser.displayName}</h3>
              <div
                className="radial-progress text-primary mt-4"
                style={{
                  "--value": selectedUser.compatibilityPercentage,
                  "--size": "100px",
                  "--thickness": "6px",
                }}
              >
                {selectedUser.compatibilityPercentage}%
              </div>
              <h4 className="mt-4 text-lg font-semibold flex items-center">
                <FaMusic className="mr-2" /> Shared Favorite Artists:
              </h4>
              <ul className="list-disc list-inside text-sm">
                {selectedUser.sharedArtists.map((artist) => (
                  <li key={artist.id}>{artist.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compatibility;
