// src/services/tmdb.js

import axios from 'axios';
import { getIdToken } from './auth';

// Base URL for your backend API
const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

// Axios instance
export const api = axios.create({
  baseURL: BACKEND_URL,
});

// ------------ TMDb ENDPOINTS ------------

// Search with filters
export function searchMedia(query, type = 'movie', page = 1, filters = {}) {
  return api.get('/search', {
    params: { query, type, page, ...filters },
  });
}

// Get details + credits + videos + images
export function getDetails(type, id) {
  return api.get(`/${type}/${id}`);
}

// Get similar recommendations
export function getSimilar(type, id) {
  return api.get(`/${type}/${id}/similar`);
}

// ------------ REVIEWS CRUD ------------

// Create review
export async function postReview(tmdb_id, type, rating, review_text) {
  const token = await getIdToken();
  return api.post(
    '/reviews',
    { tmdb_id, type, rating, review_text },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// Read reviews for a given media
export function fetchReviews(tmdb_id, type) {
  return api.get('/reviews', {
    params: { tmdb_id, type },
  });
}

// Update review (only owner)
export async function updateReview(id, { rating, review_text }) {
  const token = await getIdToken();
  return api.put(
    `/reviews/${id}`,
    { rating, review_text },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// Delete review (only owner)
export async function deleteReview(id) {
  const token = await getIdToken();
  return api.delete(`/reviews/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ------------ COMMENTS CRUD ------------

// Create comment
export async function postComment(review_id, comment_text) {
  const token = await getIdToken();
  return api.post(
    '/comments',
    { review_id, comment_text },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// Read comments for a review
export function fetchComments(review_id) {
  return api.get('/comments', {
    params: { review_id },
  });
}

// Update comment (only owner)
export async function updateComment(id, { comment_text }) {
  const token = await getIdToken();
  return api.put(
    `/comments/${id}`,
    { comment_text },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// Delete comment (only owner)
export async function deleteComment(id) {
  const token = await getIdToken();
  return api.delete(`/comments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ------------ LIKES ------------

export async function postLike(review_id) {
  const token = await getIdToken();
  return api.post(
    '/likes',
    { review_id },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function deleteLike(review_id) {
  const token = await getIdToken();
  return api.delete('/likes', {
    headers: { Authorization: `Bearer ${token}` },
    params: { review_id },
  });
}

export async function fetchLikes(review_id) {
  const token = await getIdToken();
  return api.get('/likes', {
    headers: { Authorization: `Bearer ${token}` },
    params: { review_id },
  });
}

// ------------ FAVORITES ------------

export async function addFavorite(tmdb_id, type) {
  const token = await getIdToken();
  return api.post(
    '/favorites',
    { tmdb_id, type },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export function fetchFavorites(user_id) {
  return api.get('/favorites', {
    params: { user_id },
  });
}

export async function removeFavorite(favId) {
  const token = await getIdToken();
  return api.delete(`/favorites/${favId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ------------ WATCHLIST ------------

export async function addToWatchlist(tmdb_id, type, status) {
  const token = await getIdToken();
  return api.post(
    '/watchlist',
    { tmdb_id, type, status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function fetchWatchlist() {
  const token = await getIdToken();
  return api.get('/watchlist', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateWatchlist(id, status) {
  const token = await getIdToken();
  return api.put(
    `/watchlist/${id}`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function removeFromWatchlist(id) {
  const token = await getIdToken();
  return api.delete(`/watchlist/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}