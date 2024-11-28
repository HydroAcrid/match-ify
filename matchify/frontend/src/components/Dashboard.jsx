import React from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/'));
  };

  return (
    <div>
      <h1>Welcome, {auth.currentUser.displayName || 'User'}!</h1>
      <p>Email: {auth.currentUser.email}</p>
      <button onClick={handleLogout}>Logout</button>
      {/* Add more content here */}
    </div>
  );
};

export default Dashboard;
