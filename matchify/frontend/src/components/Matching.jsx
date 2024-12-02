import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast, { Toaster } from 'react-hot-toast';

const Matching = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [artistResults, setArtistResults] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const navigate = useNavigate();

  // Debounce the search term to limit API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Fetch artist results when debouncedTerm changes
  useEffect(() => {
    const fetchArtists = async () => {
      if (debouncedTerm) {
        try {
          const token = await auth.currentUser.getIdToken();
          const response = await axios.get(
            `http://localhost:5001/ked225/us-central1/api/api/search/artists`,
            {
              params: { query: debouncedTerm },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setArtistResults(response.data);
        } catch (error) {
          console.error('Error fetching artists:', error);
        }
      } else {
        setArtistResults([]);
      }
    };

    fetchArtists();
  }, [debouncedTerm]);

  // Remove the useEffect that redirects to dashboard if user has favorite artists
  /*
  useEffect(() => {
    const checkUserArtists = async () => {
      try {
        const uid = auth.currentUser.uid;
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.favoriteArtists && userData.favoriteArtists.length === 5) {
            // User already has 5 favorite artists, redirect to dashboard
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error checking user artists:', error);
      }
    };

    checkUserArtists();
  }, [navigate]);
  */

  const handleSelectArtist = (artist) => {
    if (selectedArtists.length >= 5) {
      toast.error('You can select up to 5 artists.');
      return;
    }
    const isAlreadySelected = selectedArtists.some((a) => a.id === artist.id);
    if (isAlreadySelected) {
      toast.error('You have already selected this artist.');
      return;
    }
    setSelectedArtists([...selectedArtists, artist]);
  };

  const handleRemoveArtist = (artistId) => {
    setSelectedArtists(selectedArtists.filter((a) => a.id !== artistId));
  };

  const handleSubmit = async () => {
    if (selectedArtists.length !== 5) {
      toast.error('Please select exactly 5 artists.');
      return;
    }
    try {
      const uid = auth.currentUser.uid;
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        favoriteArtists: selectedArtists.map((artist) => ({
          id: artist.id,
          name: artist.name,
        })),
      });
      toast.success('Your favorite artists have been saved!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving favorite artists:', error);
      toast.error('Failed to save your favorite artists.');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-neutral text-base-content font-sans">
      <Toaster />
      <nav className="navbar mb-6 bg-neutral text-base-content">
        <div className="flex-1">
          <a className="normal-case text-xl text-primary">Matchify</a>
        </div>
      </nav>
      <h1 className="text-3xl font-bold text-center mb-6 text-primary">
        Select Your Top 5 Artists
      </h1>
      <div className="flex w-full space-x-4">
        {/* Left Side: Search and Results */}
        <div className="w-1/2 pr-4">
          <div className="form-control mb-4">
            <input
              type="text"
              placeholder="Search for artists"
              className="input input-bordered input-primary w-full text-base-content placeholder-base-content"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
            {artistResults.length > 0 && (
              <table className="table w-full text-base-content">
                <tbody>
                  {artistResults.map((artist) => (
                    <tr
                      key={artist.id}
                      className="hover:bg-base-200 cursor-pointer"
                      onClick={() => handleSelectArtist(artist)}
                    >
                      <td className="w-16">
                        <div className="avatar">
                          <div className="mask mask-circle w-16 h-16">
                            {artist.images?.[2]?.url ? (
                              <img
                                src={artist.images[2].url}
                                alt={artist.name}
                                className="w-16 h-16 object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center bg-gray-600">
                                <span className="text-white text-sm">
                                  {artist.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-bold text-base-content">
                          {artist.name}
                        </div>
                        <div className="text-sm opacity-75 text-base-content">
                          {artist.genres?.[0] || 'Unknown Genre'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Side: Selected Artists */}
        <div className="w-1/2 pl-4">
          {selectedArtists.length > 0 ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Your Selected Artists
              </h2>
              <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
                {selectedArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className="card card-side items-center bg-base-100 shadow-xl mb-4 hover:bg-base-200 text-base-content"
                  >
                    <figure className="pl-4">
                      <div className="avatar">
                        <div className="mask mask-circle w-16 h-16">
                          {artist.images?.[1]?.url ? (
                            <img
                              src={artist.images[1].url}
                              alt={artist.name}
                              className="w-16 h-16 object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center bg-gray-600">
                              <span className="text-white text-lg">
                                {artist.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </figure>
                    <div className="card-body">
                      <h2 className="card-title text-base-content">
                        {artist.name}
                      </h2>
                      <div className="card-actions justify-end">
                        <button
                          className="btn btn-sm btn-secondary text-base-content"
                          onClick={() => handleRemoveArtist(artist.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Proceed button */}
              {selectedArtists.length === 5 && (
                <button
                  className="btn btn-primary w-full mt-4 text-base-content"
                  onClick={handleSubmit}
                >
                  Proceed to Dashboard
                </button>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No artists selected yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Matching;
