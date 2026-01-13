import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Login = ({ setUser }) => {
    const [usn, setUsn] = useState('');
    const [role, setRole] = useState('user'); // 'user' or 'admin'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:8080/api/login', { usn, role });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
        } catch (err) {
            setError('Failed to login. Please try again.');
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
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px' }}>Enter your USN to login or register</p>

                <form onSubmit={handleLogin}>
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
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                            *Role selection applies only for new registrations.
                        </p>
                    </div>

                    {error && <p style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Enter Space'}
                    </button>

                    <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        New? Enter your USN and select your role to create your account automatically.
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
