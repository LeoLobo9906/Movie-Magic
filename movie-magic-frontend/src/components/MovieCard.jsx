import React from 'react';
import Dummy from '../assets/dummy-poster.jpg'; // Place a local file in src/assets/

export default function MovieCard({ item }) {
  const imgUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
    : Dummy;

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <img
        src={imgUrl}
        alt={item.title || item.name}
        className="w-full h-60 object-cover"
      />
      <div className="p-2">
        <h3 className="font-semibold truncate">{item.title || item.name}</h3>
        <p className="text-sm text-gray-600">
          Rating: {item.vote_average ?? 'N/A'}
        </p>
      </div>
    </div>
  );
}