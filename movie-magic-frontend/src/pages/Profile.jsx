import React, { useState, useEffect } from 'react';
import { auth, updateUserProfile } from '../services/auth';
import { saveUserBio, getUserBio } from '../services/firestore';

export default function Profile() {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [bio, setBio] = useState('');
  const [bioLoading, setBioLoading] = useState(true);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile({ displayName, photoURL });
      await saveUserBio(auth.currentUser.uid, bio); // ✅ Save bio separately
      setMessage('Profile updated!');
    } catch (err) {
      console.error(err);
      setMessage('Update failed');
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setDisplayName(user.displayName || '');
        setPhotoURL(user.photoURL || '');
        setBioLoading(true); // Start loading
        const fetchedBio = await getUserBio(user.uid);
        setBio(fetchedBio || '');
        setBioLoading(false); // Done loading
      }
    }
    fetchData();
  }, [user]);

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">My Profile</h2>

      <div className="flex flex-col items-center justify-center mb-6 text-center">
        {photoURL && (
          <img
            src={photoURL}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mb-2"
          />
        )}
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {displayName || 'No Name'}
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
          {bio.trim() !== '' ? bio : 'No bio available.'}
        </p>
      </div>

      {message && (
        <p
          className={`mb-4 text-sm ${
            message === 'Profile updated!' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Display Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 rounded"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Photo URL</label>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 rounded"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Bio</label>
          <textarea
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2 rounded"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="3"
            placeholder="Tell us about yourself..."
          ></textarea>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}