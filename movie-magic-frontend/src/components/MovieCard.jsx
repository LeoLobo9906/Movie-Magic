import React from 'react';
import Dummy from '../assets/dummy-poster.jpg'; // Local backup image

export default function MovieCard({ item }) {
  const imgUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
    : Dummy;

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded shadow overflow-hidden">
      <img
        src={imgUrl}
        alt={item.title || item.name}
        className="w-full h-60 object-cover"
      />
      <div className="p-3">
        <h3 className="font-semibold truncate text-black dark:text-white">{item.title || item.name}</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Rating: {item.vote_average ?? 'N/A'}
        </p>
      </div>
    </div>
  );
}