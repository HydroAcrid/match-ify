import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/'));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth.currentUser.uid;
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
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
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">Matchify</a>
        </div>
        <div className="flex-none">
          <button className="btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className="container mx-auto py-8">
        {userData ? (
          <div className="card w-full max-w-md bg-base-100 shadow-xl mx-auto">
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
              <p>Email: {userData.email}</p>
              {/* Display other user information */}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <button className="btn loading">Loading...</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
