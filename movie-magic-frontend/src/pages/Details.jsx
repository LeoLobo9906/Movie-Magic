// src/pages/Details.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  getDetails,
  fetchReviews,
  postReview,
  updateReview,
  deleteReview,
  fetchComments,
  postComment,
  updateComment,
  deleteComment,
  fetchLikes,
  postLike,
  deleteLike,
  getSimilar,
  addFavorite
} from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import ShareButtons from '../components/ShareButtons';
import Skeleton from '../components/Skeleton';

export default function Details({ user }) {
  const { type, id } = useParams();
  const location = useLocation();
  const shareUrl = window.location.origin + location.pathname;

  const [detail, setDetail] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState({});
  const [likes, setLikes] = useState({});

  // New review state
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  // Comments input state per review
  const [newComments, setNewComments] = useState({}); // { reviewId: text }

  // Edit states
  const [editingReview, setEditingReview] = useState(null); // reviewId
  const [editReviewText, setEditReviewText] = useState('');
  const [editReviewRating, setEditReviewRating] = useState(5);

  const [editingComment, setEditingComment] = useState(null); // commentId
  const [editCommentText, setEditCommentText] = useState('');

  const [trailers, setTrailers] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [similar, setSimilar] = useState([]);

  // Load details, reviews, media, similar
  useEffect(() => {
    getDetails(type, id).then(res => {
      const d = res.data;
      setDetail(d);
      setTrailers((d.videos?.results || []).filter(v => v.site === 'YouTube' && v.type === 'Trailer'));
      setImages(d.images?.backdrops || []);
    });
    fetchReviews(id, type).then(r => setReviews(r.data));
    getSimilar(type, id).then(r => setSimilar(r.data.results || []));
  }, [type, id]);

  // Load comments & likes whenever reviews change
  useEffect(() => {
    reviews.forEach(r => {
      fetchComments(r.id).then(r2 => setComments(c => ({ ...c, [r.id]: r2.data })));
      if (user) fetchLikes(r.id).then(r3 => setLikes(l => ({ ...l, [r.id]: r3.data })));
    });
  }, [reviews, user]);

  // Handlers
  const refreshReviews = () => fetchReviews(id, type).then(r => setReviews(r.data));

  const handleAddReview = async () => {
    await postReview(id, type, rating, text);
    setText('');
    refreshReviews();
  };

  const startEditReview = (r) => {
    setEditingReview(r.id);
    setEditReviewText(r.review_text);
    setEditReviewRating(r.rating);
  };
  const handleUpdateReview = async () => {
    await updateReview(editingReview, { rating: editReviewRating, review_text: editReviewText });
    setEditingReview(null);
    refreshReviews();
  };
  const handleDeleteReview = async (rid) => {
    if (window.confirm('Delete this review?')) {
      await deleteReview(rid);
      refreshReviews();
    }
  };

  const handleAddComment = async (reviewId) => {
    const txt = (newComments[reviewId] || '').trim();
    if (!txt) return;
    await postComment(reviewId, txt);
    setNewComments(nc => ({ ...nc, [reviewId]: '' }));
    fetchComments(reviewId).then(r => setComments(c => ({ ...c, [reviewId]: r.data })));
  };

  const startEditComment = (c) => {
    setEditingComment(c.id);
    setEditCommentText(c.comment_text);
  };
  const handleUpdateComment = async () => {
    await updateComment(editingComment, { comment_text: editCommentText });
    const revId = Object.keys(comments).find(rid =>
      comments[rid].some(c => c.id === editingComment)
    );
    setEditingComment(null);
    fetchComments(revId).then(r => setComments(c => ({ ...c, [revId]: r.data })));
  };
  const handleDeleteComment = async (cid, reviewId) => {
    if (window.confirm('Delete this comment?')) {
      await deleteComment(cid);
      fetchComments(reviewId).then(r => setComments(c => ({ ...c, [reviewId]: r.data })));
    }
  };

  const handleLike = async (reviewId) => {
    const { liked } = likes[reviewId] || {};
    if (liked) await deleteLike(reviewId);
    else await postLike(reviewId);
    fetchLikes(reviewId).then(r => setLikes(l => ({ ...l, [reviewId]: r.data })));
  };

  const handleFavorite = async () => {
    await addFavorite(id, type);
    alert('Added to favorites!');
  };

  if (!detail) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton width="w-1/3" height="h-8" />
        <Skeleton width="w-full" height="h-4" />
        <Skeleton width="w-full" height="h-4" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{detail.title || detail.name}</h1>
        <p>{detail.overview}</p>
        <div className="flex items-center space-x-4">
          {user && (
            <button onClick={handleFavorite} className="bg-green-500 text-white px-4 py-2 rounded">
              Add to Favorites
            </button>
          )}
          <ShareButtons title={detail.title || detail.name} url={shareUrl} />
        </div>
      </header>

      {/* Trailers */}
      {trailers.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-2">Trailers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trailers.map(t => (
              <iframe
                key={t.id}
                title={t.name}
                width="100%"
                height="300"
                src={`https://www.youtube.com/embed/${t.key}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded shadow"
              />
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      {images.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-2">Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {images.slice(0, 12).map(img => (
              <img
                key={img.file_path}
                src={`https://image.tmdb.org/t/p/w300${img.file_path}`}
                alt={`${detail.title || detail.name} backdrop`}
                className="cursor-pointer rounded shadow hover:opacity-75"
                onClick={() => setSelectedImage(img.file_path)}
              />
            ))}
          </div>
          {selectedImage && (
            <div
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
            >
              <img
                src={`https://image.tmdb.org/t/p/original${selectedImage}`}
                alt={`${detail.title || detail.name} large backdrop`}
                className="max-h-full max-w-full rounded"
              />
            </div>
          )}
        </section>
      )}

      {/* Reviews */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        {reviews.map(r => (
          <div key={r.id} className="border p-4 rounded mb-4">
            {editingReview === r.id ? (
              <div className="space-y-2">
                <select
                  value={editReviewRating}
                  onChange={e => setEditReviewRating(Number(e.target.value))}
                  className="border rounded px-2"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </select>
                <textarea
                  rows="3"
                  value={editReviewText}
                  onChange={e => setEditReviewText(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
                <div className="space-x-2">
                  <button onClick={handleUpdateReview} className="bg-blue-500 text-white px-3 py-1 rounded">
                    Save
                  </button>
                  <button onClick={() => setEditingReview(null)} className="text-gray-600">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span>Rating: {r.rating}/10</span>
                  <div className="flex items-center space-x-2">
                    {user && likes[r.id] && (
                      <button onClick={() => handleLike(r.id)} className="flex items-center space-x-1">
                        {likes[r.id].liked ? '💖' : '🤍'} {likes[r.id].count}
                      </button>
                    )}
                    {user?.uid === r.user_id && (
                      <>
                        <button onClick={() => startEditReview(r)} className="text-blue-500">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteReview(r.id)} className="text-red-500">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="mb-4">{r.review_text}</p>
              </>
            )}

            {/* Comments */}
            <div className="pl-4 space-y-3">
              {(comments[r.id] || []).map(c => (
                <div key={c.id} className="border-l pl-2">
                  {editingComment === c.id ? (
                    <div className="flex space-x-2">
                      <input
                        className="flex-1 border rounded px-2"
                        value={editCommentText}
                        onChange={e => setEditCommentText(e.target.value)}
                      />
                      <button onClick={handleUpdateComment} className="bg-blue-500 text-white px-2 rounded">
                        Save
                      </button>
                      <button onClick={() => setEditingComment(null)} className="text-gray-600">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <p>{c.comment_text}</p>
                      {user?.uid === c.user_id && (
                        <div className="space-x-2">
                          <button onClick={() => startEditComment(c)} className="text-blue-500">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteComment(c.id, r.id)} className="text-red-500">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {user && (
                <div className="flex space-x-2 mt-2">
                  <input
                    className="flex-1 border rounded px-2 py-1"
                    placeholder="Add a comment..."
                    value={newComments[r.id] || ''}
                    onChange={e =>
                      setNewComments(nc => ({ ...nc, [r.id]: e.target.value }))
                    }
                  />
                  <button onClick={() => handleAddComment(r.id)} className="bg-blue-500 text-white px-3 rounded">
                    Post
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {user && editingReview === null && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Write a Review</h3>
            <select
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
              className="border rounded px-2"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
            <textarea
              rows="4"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Your thoughts..."
              className="w-full border rounded px-2 py-1"
            />
            <button onClick={handleAddReview} className="bg-blue-500 text-white px-4 py-2 rounded">
              Submit Review
            </button>
          </div>
        )}
      </section>

      {/* Similar Recommendations */}
      {similar.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-2">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {similar.map(item => (
              <Link key={item.id} to={`/details/${type}/${item.id}`}>
                <MovieCard item={item} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}