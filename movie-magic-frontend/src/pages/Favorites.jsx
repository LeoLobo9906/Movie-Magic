// src/pages/Favorites.jsx
import React, { useEffect, useState } from 'react';
import { fetchFavorites, getDetails, api } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { Link } from 'react-router-dom';
import { getIdToken } from '../services/auth';

export default function Favorites({ user }) {
  const [favorites, setFavorites] = useState([]);   // raw rows
  const [items, setItems] = useState([]);           // detailed objects
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadFavorites() {
      setLoading(true);
      try {
        // 1. Fetch favorite rows
        const res = await fetchFavorites(user.uid);
        setFavorites(res.data);

        // 2. Fetch details for each
        const detailPromises = res.data.map((fav) =>
          getDetails(fav.type, fav.tmdb_id).then((r) => ({
            ...r.data,
            _favId: fav.id,
            _favType: fav.type,
          }))
        );
        const detailedItems = await Promise.all(detailPromises);
        setItems(detailedItems);
      } catch (err) {
        console.error('Failed loading favorites', err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [user]);

  const handleRemove = async (favId) => {
    try {
      const token = await getIdToken();
      console.log('Deleting favorite', favId, 'with token', token);
      const response = await api.delete(`/favorites/${favId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Delete response:', response.data);
      // Update UI
      setItems((prev) => prev.filter((item) => item._favId !== favId));
    } catch (err) {
      console.error('Remove favorite error:', err.response || err);
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Unknown error';
      alert(`Could not remove favorite: ${msg}`);
    }
  };

  if (loading) {
    return <p>Loading favorites…</p>;
  }

  if (!items.length) {
    return <p>You haven’t added any favorites yet.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Favorites</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item._favId} className="relative">
            <Link to={`/details/${item._favType}/${item.id}`}>
              <MovieCard item={item} />
            </Link>
            <button
              onClick={() => handleRemove(item._favId)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              title="Remove from favorites"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}