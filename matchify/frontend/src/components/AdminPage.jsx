import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import axios from 'axios';

const AdminPage = () => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all users from Firestore
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsersData(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-neutral text-base-content font-sans">
      <nav className="navbar mb-6 bg-neutral text-base-content">
        <div className="flex-1">
          <a className="normal-case text-xl text-primary">Admin Dashboard</a>
        </div>
      </nav>
      <h1 className="text-3xl font-bold text-center mb-6 text-primary">
        User Analytics
      </h1>
      {loading ? (
        <div className="text-center">
          <button className="btn loading">Loading...</button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full text-base-content">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Display Name</th>
                <th>Email</th>
                <th>Favorite Artists</th>
              </tr>
            </thead>
            <tbody>
              {usersData.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.displayName || 'N/A'}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td>
                    {user.favoriteArtists
                      ? user.favoriteArtists.map((artist) => artist.name).join(', ')
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
