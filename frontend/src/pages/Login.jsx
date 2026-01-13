import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Login = ({ setUser }) => {
    const [mode, setMode] = useState('login');
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
        <div className="cross-hatch" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--black)' }}>
            <div style={{ position: 'fixed', top: '40px', left: '40px', opacity: 0.3 }} className="monospaced caps">
                <div>REF: LOGIN_INTERFACE_V2.0</div>
                <div>C/O 2026 JSS STU.</div>
            </div>

            <div style={{ position: 'fixed', bottom: '40px', right: '40px', opacity: 0.3 }} className="monospaced caps">
                <div>FOR DISPLAY PURPOSES ONLY</div>
                <div style={{ textAlign: 'right' }}>©2026</div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="card-industrial"
                style={{ width: '100%', maxWidth: '450px', border: '1px solid var(--white)', padding: '60px 40px' }}
            >
                <div className="card-metadata">ID: 001-ALPHA</div>

                <h1 className="caps" style={{ marginBottom: '40px', fontSize: '2.5rem', letterSpacing: '-0.06em', textAlign: 'center' }}>
                    "SIGN IN"
                </h1>

                <div style={{ display: 'flex', gap: '2px', marginBottom: '40px' }}>
                    <button
                        onClick={() => setMode('login')}
                        className={`caps ${mode === 'login' ? '' : 'opacity-30'}`}
                        style={{ flex: 1, padding: '12px', background: mode === 'login' ? 'var(--white)' : 'transparent', color: mode === 'login' ? 'var(--black)' : 'var(--white)', border: '1px solid var(--white)', cursor: 'pointer', fontWeight: '900', fontSize: '11px' }}
                    > 01 // LOGIN </button>
                    <button
                        onClick={() => setMode('register')}
                        className={`caps ${mode === 'register' ? '' : 'opacity-30'}`}
                        style={{ flex: 1, padding: '12px', background: mode === 'register' ? 'var(--white)' : 'transparent', color: mode === 'register' ? 'var(--black)' : 'var(--white)', border: '1px solid var(--white)', cursor: 'pointer', fontWeight: '900', fontSize: '11px' }}
                    > 02 // REGISTER </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                        <label className="input-label">"COLLEGE USN"</label>
                        <input
                            type="text"
                            className="input-industrial caps"
                            placeholder="SAMPLE: 1JSXXCSXXX"
                            value={usn}
                            onChange={(e) => setUsn(e.target.value.toUpperCase())}
                            required
                        />
                    </div>

                    {mode === 'register' && (
                        <div style={{ marginBottom: '32px' }}>
                            <label className="input-label">"ROLE SELECTION"</label>
                            <div style={{ display: 'flex', gap: '32px' }}>
                                <label className="monospaced caps" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '12px' }}>
                                    <input type="radio" name="role" value="user" checked={role === 'user'} onChange={() => setRole('user')} style={{ accentColor: 'var(--safety-orange)' }} />
                                    [ USER ]
                                </label>
                                <label className="monospaced caps" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '12px' }}>
                                    <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} style={{ accentColor: 'var(--safety-orange)' }} />
                                    [ ADMIN ]
                                </label>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div style={{ color: 'var(--safety-orange)', fontSize: '11px', marginBottom: '24px', border: '1px solid var(--safety-orange)', padding: '10px' }} className="monospaced caps">
                            ERROR: {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-industrial hover-glitch"
                        style={{ width: '100%', justifyContent: 'center', background: 'var(--white)', color: 'var(--black)', fontSize: '14px' }}
                        disabled={loading}
                        data-ref="PROC_098"
                    >
                        {loading ? '...PROCESSING' : (mode === 'login' ? '"ENTER SPACE"' : '"INITIATE"')}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
