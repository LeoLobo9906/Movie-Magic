// src/components/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SearchBar() {
  const navigate = useNavigate();

  // Search inputs
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie');
  const [genreList, setGenreList] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [minRating, setMinRating] = useState('');

  // Load TMDb genres on mount
  useEffect(() => {
    axios
      .get('https://api.themoviedb.org/3/genre/movie/list', {
        params: { api_key: import.meta.env.VITE_REACT_APP_TMDB_API_KEY },
      })
      .then((res) => setGenreList(res.data.genres || []))
      .catch(console.error);
  }, []);

  const toggleGenre = (id) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      query,
      type,
      ...(selectedGenres.length && { genre_ids: selectedGenres.join(',') }),
      ...(yearFrom && { year_from: yearFrom }),
      ...(yearTo && { year_to: yearTo }),
      ...(minRating && { min_rating: minRating }),
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      <div className="flex space-x-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="movie">Movie</option>
          <option value="tv">TV Show</option>
        </select>
        <input
          type="text"
          placeholder="Search titles…"
          className="flex-1 border rounded px-3 py-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {/* Genre Filters */}
      <div>
        <p className="font-medium mb-1">Genres:</p>
        <div className="flex flex-wrap gap-2">
          {genreList.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => toggleGenre(g.id)}
              className={`px-2 py-1 rounded border ${
                selectedGenres.includes(g.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Year Range & Min Rating */}
      <div className="flex space-x-2">
        <div>
          <label className="block text-sm">Year from</label>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            className="border rounded px-2 py-1 w-24"
          />
        </div>
        <div>
          <label className="block text-sm">Year to</label>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            className="border rounded px-2 py-1 w-24"
          />
        </div>
        <div>
          <label className="block text-sm">Min Rating</label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">Any</option>
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}+
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}