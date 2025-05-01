// src/components/Header.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { logout, loginWithGoogle } from '../services/auth';
import { useTranslation } from 'react-i18next';

export default function Header({ user }) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { dark, setDark } = useContext(ThemeContext);

  const handleLogout = async () => {
    await logout();
    nav('/login');
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      nav('/');
    } catch {
      alert(t('Login failed'));
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow" role="banner">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <nav aria-label="Main navigation" className="flex items-center space-x-4">
          <Link to="/" className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {t('Movie Magic')}
          </Link>
          {/*<Link to="/search" className="hover:underline text-gray-600 dark:text-gray-300">
            {t('Search')}
          </Link>*/}
          <Link to="/favorites" className="hover:underline text-gray-600 dark:text-gray-300">
            {t('Favorites')}
          </Link>
          <Link to="/watchlist" className="hover:underline text-gray-600 dark:text-gray-300">
            {t('Watchlist')}
          </Link>
          <Link to="/profile" className="hover:underline text-gray-600 dark:text-gray-300">
            {t('Profile')}
          </Link>
        </nav>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded bg-gray-200 text-xl"
            aria-label={t('Toggle Dark Mode')}
          >
            {dark ? '☀️' : '🌙'}
          </button>
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              {t('Logout')}
            </button>
          ) : (
            <>
              <button
                onClick={handleGoogleLogin}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                {t('Google')}
              </button>
              <Link
                to="/login"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {t('Login')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}