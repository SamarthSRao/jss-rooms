import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Explore from './pages/Explore';
import Room from './pages/Room';
import AdminDashboard from './pages/AdminDashboard';
import Landing from './pages/Landing';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

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
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/explore" />} />
          <Route path="/explore" element={user ? <Explore user={user} /> : <Navigate to="/login" />} />
          <Route path="/room/:id" element={user ? <Room user={user} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/explore" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
