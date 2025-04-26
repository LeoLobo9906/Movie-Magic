import React from 'react';
import SearchBar from '../components/SearchBar';

export default function Home() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">🎬 Welcome to Movie Magic</h1>
      <p className="mb-6 text-gray-600">
        Discover and review your favorite movies & TV shows.
      </p>
      <SearchBar />
    </div>
  );
}