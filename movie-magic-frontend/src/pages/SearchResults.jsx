// src/pages/SearchResults.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchMedia } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import Skeleton from '../components/Skeleton';
import { useTranslation } from 'react-i18next';

export default function SearchResults() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const query = params.get('query') || '';
  const type = params.get('type') || 'movie';
  const filters = {
    genre_ids: params.get('genre_ids'),
    year_from: params.get('year_from'),
    year_to: params.get('year_to'),
    min_rating: params.get('min_rating'),
  };
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    searchMedia(query, type, 1, filters)
      .then(res => setResults(res.data.results || []))
      .catch(err => {
        console.error(err);
        setError(t('Failed to fetch results.'));
      })
      .finally(() => setLoading(false));
  }, [query, type, JSON.stringify(filters), t]);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex space-x-4 items-center">
            <Skeleton width="w-24" height="h-32" />
            <div className="flex-1 space-y-2 py-1">
              <Skeleton width="w-3/4" />
              <Skeleton width="w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!results.length) {
    return <p>{t('No results found')} “{query}”.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        {t('Results for')} “{query}”
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {results.map(item => (
          <Link
            key={item.id}
            to={`/details/${type}/${item.id}`}
            aria-label={`${item.title || item.name}: ${t('View Details')}`}
          >
            <MovieCard item={item} />
          </Link>
        ))}
      </div>
    </div>
  );
}