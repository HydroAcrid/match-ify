import React from 'react';
import { Link } from 'react-router-dom';

const NotAuthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      <h1 className="text-5xl font-bold mb-6">Access Denied</h1>
      <p className="mb-4">You do not have permission to view this page.</p>
      <Link to="/dashboard">
        <button className="btn btn-primary">Go to Dashboard</button>
      </Link>
    </div>
  );
};

export default NotAuthorized;
