import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Login = ({ setUser }) => {
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [usn, setUsn] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const endpoint = mode === 'login' ? 'login' : 'register';
            const payload = mode === 'login' ? { usn } : { usn, role };
            const response = await axios.post(`http://localhost:8080/api/${endpoint}`, payload);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
        } catch (err) {
            setError(err.response?.data || 'Failed to process request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel"
                style={{ padding: '40px', width: '100%', maxWidth: '400px' }}
            >
                <h1 style={{ marginBottom: '8px', textAlign: 'center' }}>JSS Rooms</h1>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'var(--bg-card)', padding: '4px', borderRadius: '12px' }}>
                    <button
                        onClick={() => setMode('login')}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: mode === 'login' ? 'var(--primary)' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                    > Login </button>
                    <button
                        onClick={() => setMode('register')}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: mode === 'register' ? 'var(--primary)' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                    > Register </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>College USN</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. 1JS21CS001"
                            value={usn}
                            onChange={(e) => setUsn(e.target.value.toUpperCase())}
                            required
                        />
                    </div>

                    {mode === 'register' && (
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px' }}>Registering as:</label>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                    <input type="radio" name="role" value="user" checked={role === 'user'} onChange={() => setRole('user')} />
                                    Student
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                    <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} />
                                    Admin
                                </label>
                            </div>
                        </div>
                    )}

                    {error && <p style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (mode === 'login' ? 'Enter Space' : 'Create Account')}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
