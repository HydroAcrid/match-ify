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
    <div className="min-h-screen p-6">
    <Toaster />
    <nav className="navbar mb-6">
        <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">Matchify</a>
        </div>
    </nav>
    <h1 className="text-3xl font-bold text-center mb-6">
        Select Your Top 5 Artists
    </h1>
    <div className="flex justify-between items-start w-full space-x-4">
        {/* Left Side: Search and Results */}
        <div className="flex-grow pr-4 bg-red-100">
        <div className="form-control mb-4">
            <input
            type="text"
            placeholder="Search for artists"
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
            {artistResults.length > 0 && (
            <table className="table w-full">
                <tbody>
                {artistResults.map((artist) => (
                    <tr
                    key={artist.id}
                    className="hover:bg-gray-100 cursor-pointer"
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
                        <div className="font-bold">{artist.name}</div>
                        <div className="text-sm opacity-50">
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
        <div className="flex-grow pl-4 bg-blue-100 min-h-[200px]">
        {selectedArtists.length > 0 ? (
            <div>
            <h2 className="text-2xl font-semibold mb-4">Your Selected Artists</h2>
            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                {selectedArtists.map((artist) => (
                <div
                    key={artist.id}
                    className="card card-side bg-base-100 shadow-xl mb-4"
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
                    <h2 className="card-title">{artist.name}</h2>
                    <div className="card-actions justify-end">
                        <button
                        className="btn btn-sm btn-error"
                        onClick={() => handleRemoveArtist(artist.id)}
                        >
                        Remove
                        </button>
                    </div>
                    </div>
                </div>
                ))}
            </div>
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
