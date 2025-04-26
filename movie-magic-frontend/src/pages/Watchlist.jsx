// src/pages/Watchlist.jsx

import React, { useEffect, useState } from 'react';
import {
  fetchWatchlist,
  updateWatchlist,
  removeFromWatchlist,
  getDetails,
} from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { Link } from 'react-router-dom';

export default function Watchlist() {
  const [entries, setEntries] = useState([]); // raw watchlist rows
  const [items, setItems] = useState([]);     // detailed TMDb items

  useEffect(() => {
    async function load() {
      const res = await fetchWatchlist();
      setEntries(res.data);
      const detailed = await Promise.all(
        res.data.map((e) =>
          getDetails(e.type, e.tmdb_id).then((r) => ({
            ...r.data,
            _id: e.id,
            _status: e.status,
            _type: e.type,
          }))
        )
      );
      setItems(detailed);
    }
    load();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    await updateWatchlist(id, newStatus);
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, _status: newStatus } : i))
    );
  };

  const handleRemove = async (id) => {
    await removeFromWatchlist(id);
    setItems((prev) => prev.filter((i) => i._id !== id));
  };

  if (!items.length) {
    return <p>Your watchlist is empty.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Watchlist</h2>
      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center bg-white p-4 rounded shadow"
          >
            <Link to={`/details/${item._type}/${item.id}`}>
              <MovieCard item={item} />
            </Link>
            <div className="ml-4 space-y-2">
              <select
                value={item._status}
                onChange={(e) =>
                  handleStatusChange(item._id, e.target.value)
                }
                className="border rounded px-2 py-1"
              >
                <option value="want">Want to Watch</option>
                <option value="watching">Watching</option>
                <option value="watched">Watched</option>
              </select>
              <button
                onClick={() => handleRemove(item._id)}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}