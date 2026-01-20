import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Explore from './pages/Explore';
import Room from './pages/Room';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import EventDetails from './pages/EventDetails';
import CheckIn from './pages/CheckIn';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <Router>
      <div className="app">
        {user && <Navbar user={user} setUser={setUser} />}
        <Routes>
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/explore" />} />
          <Route path="/explore" element={user ? <Explore user={user} /> : <Navigate to="/login" />} />
          <Route path="/room/:id" element={user ? <Room user={user} /> : <Navigate to="/login" />} />
          <Route path="/event/:id" element={user ? <EventDetails user={user} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/explore" />} />
          <Route path="/admin/checkin" element={user?.role === 'admin' ? <CheckIn /> : <Navigate to="/explore" />} />
          <Route path="/" element={<Navigate to="/explore" />} />
        </Routes>

        {/* SYSTEM STATUS FEEDBACK (VIRGIL SIGNATURE) */}
        <div style={{ position: 'fixed', bottom: 10, left: 10, fontSize: '8px', opacity: 0.15, pointerEvents: 'none', zIndex: 9999 }} className="monospaced caps">
          RUNTIME_STAMP: {new Date().toISOString()} // STATUS: SECURE_FEED
        </div>
      </div>
    </Router>
  );
}

export default App;
