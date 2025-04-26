// backend/index.js

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve('./firebase-service-account.json'), 'utf8')
);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Express setup
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

// TMDb helper
const TMDB_BASE = 'https://api.themoviedb.org/3';
async function tmdbGet(endpoint, params = {}) {
  const url = `${TMDB_BASE}${endpoint}`;
  const res = await axios.get(url, {
    params: { api_key: process.env.TMDB_API_KEY, ...params },
  });
  return res.data;
}

// Auth middleware
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // uid, email, etc.
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// -------- Routes --------

// Health check
app.get('/', (_req, res) => {
  res.send('🎬 Movie Magic Backend is up and running!');
});

// Advanced search (with filters)
app.get('/api/search', async (req, res) => {
  try {
    const {
      query, type = 'movie', page = 1,
      genre_ids, year, year_from, year_to, min_rating, language,
    } = req.query;

    const params = { query, page };
    if (genre_ids) params.with_genres = genre_ids;
    if (year) params.primary_release_year = year;
    else {
      if (year_from) params['primary_release_date.gte'] = `${year_from}-01-01`;
      if (year_to)   params['primary_release_date.lte'] = `${year_to}-12-31`;
    }
    if (min_rating) params['vote_average.gte'] = min_rating;
    if (language) params.language = language;

    const data = await tmdbGet(`/search/${type}`, params);
    res.json(data);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get details + credits + videos
app.get('/api/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const data = await tmdbGet(`/${type}/${id}`, {
      append_to_response: 'credits,videos,images',
      language: req.query.language || 'en-US',
    });
    res.json(data);
  } catch (err) {
    console.error('Details error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get similar recommendations
app.get('/api/:type/:id/similar', async (req, res) => {
  try {
    const { type, id } = req.params;
    const data = await tmdbGet(`/${type}/${id}/similar`, {
      language: req.query.language || 'en-US',
      page: req.query.page || 1,
    });
    res.json(data);
  } catch (err) {
    console.error('Similar error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- REVIEWS CRUD ----------

// Create review
app.post('/api/reviews', authenticate, async (req, res) => {
  const { tmdb_id, type, rating, review_text } = req.body;
  const user_id = req.user.uid;
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ user_id, tmdb_id, type, rating, review_text }])
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Read reviews
app.get('/api/reviews', async (req, res) => {
  const { tmdb_id, type } = req.query;
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('tmdb_id', tmdb_id)
    .eq('type', type)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Update review
app.put('/api/reviews/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { rating, review_text } = req.body;
  const user_id = req.user.uid;

  // Verify owner
  const { data: existing, error: fetchErr } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', id)
    .single();
  if (fetchErr) return res.status(500).json({ error: fetchErr.message });
  if (existing.user_id !== user_id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { data, error } = await supabase
    .from('reviews')
    .update({ rating, review_text })
    .eq('id', id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Delete review
app.delete('/api/reviews/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.uid;

  // Verify owner
  const { data: existing, error: fetchErr } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', id)
    .single();
  if (fetchErr) return res.status(500).json({ error: fetchErr.message });
  if (existing.user_id !== user_id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ---------- COMMENTS CRUD ----------

// Create comment
app.post('/api/comments', authenticate, async (req, res) => {
  const { review_id, comment_text } = req.body;
  const user_id = req.user.uid;
  const { data, error } = await supabase
    .from('comments')
    .insert([{ review_id, user_id, comment_text }])
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Read comments
app.get('/api/comments', async (req, res) => {
  const { review_id } = req.query;
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('review_id', review_id)
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Update comment
app.put('/api/comments/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { comment_text } = req.body;
  const user_id = req.user.uid;

  // Verify owner
  const { data: existing, error: fetchErr } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', id)
    .single();
  if (fetchErr) return res.status(500).json({ error: fetchErr.message });
  if (existing.user_id !== user_id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { data, error } = await supabase
    .from('comments')
    .update({ comment_text })
    .eq('id', id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Delete comment
app.delete('/api/comments/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.uid;

  // Verify owner
  const { data: existing, error: fetchErr } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', id)
    .single();
  if (fetchErr) return res.status(500).json({ error: fetchErr.message });
  if (existing.user_id !== user_id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ---------- LIKES CRUD ----------

// Create like
app.post('/api/likes', authenticate, async (req, res) => {
  const { review_id } = req.body;
  const user_id = req.user.uid;
  const { data, error } = await supabase
    .from('likes')
    .insert([{ review_id, user_id }])
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Delete like
app.delete('/api/likes', authenticate, async (req, res) => {
  const { review_id } = req.query;
  const user_id = req.user.uid;
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('review_id', review_id)
    .eq('user_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Get likes count + user liked
app.get('/api/likes', authenticate, async (req, res) => {
  const { review_id } = req.query;
  const user_id = req.user.uid;
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('review_id', review_id);
  const { data: me } = await supabase
    .from('likes')
    .select('*')
    .eq('review_id', review_id)
    .eq('user_id', user_id);
  res.json({ count, liked: me.length > 0 });
});

// ---------- FAVORITES CRUD ----------

// Add favorite
app.post('/api/favorites', authenticate, async (req, res) => {
  const { tmdb_id, type } = req.body;
  const user_id = req.user.uid;
  const { data, error } = await supabase
    .from('favorites')
    .insert([{ user_id, tmdb_id, type }])
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Get favorites
app.get('/api/favorites', async (req, res) => {
  const { user_id } = req.query;
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user_id)
    .order('added_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Delete favorite
app.delete('/api/favorites/:favId', authenticate, async (req, res) => {
  const { favId } = req.params;
  const user_id = req.user.uid;
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('id', favId)
    .eq('user_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ---------- WATCHLIST CRUD ----------

// Add to watchlist
app.post('/api/watchlist', authenticate, async (req, res) => {
  const { tmdb_id, type, status } = req.body;
  const user_id = req.user.uid;
  const { data, error } = await supabase
    .from('watchlist')
    .insert([{ user_id, tmdb_id, type, status }])
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Get watchlist
app.get('/api/watchlist', authenticate, async (req, res) => {
  const user_id = req.user.uid;
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user_id)
    .order('added_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Update watchlist
app.put('/api/watchlist/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user_id = req.user.uid;
  const { data, error } = await supabase
    .from('watchlist')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user_id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Delete watchlist item
app.delete('/api/watchlist/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.uid;
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});