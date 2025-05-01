import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Details from './pages/Details';
import Favorites from './pages/Favorites';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { onAuthChange } from './services/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return unsub;
  }, []);

  if (loadingAuth) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Header user={user} />
      <main className="container mx-auto p-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route
            path="/details/:type/:id"
            element={<Details user={user} />}
          />
          <Route
            path="/favorites"
            element={
              user ? <Favorites user={user} /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/watchlist"
            element={
              user ? <Watchlist /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/profile"
            element={
              user ? <Profile /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" replace />}
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}