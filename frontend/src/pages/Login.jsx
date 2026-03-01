import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Login = ({ setUser }) => {
    const [mode, setMode] = useState('login');
    const [loginWithEmail, setLoginWithEmail] = useState(false);
    const [usn, setUsn] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation for registration
        if (mode === 'register') {
            if (!loginWithEmail) {
                const usnRegex = /^1JS\d{2}[A-Z]{2}\d{3}$/;
                if (!usnRegex.test(usn)) {
                    setError('INVALID USN FORMAT. MUST BE (e.g. 1JS21CS001)');
                    return;
                }
            } else {
                const emailRegex = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$/;
                if (!emailRegex.test(email.toLowerCase())) {
                    setError('INVALID EMAIL FORMAT');
                    return;
                }
            }
        }

        setLoading(true);
        setError('');
        try {
            const endpoint = mode === 'login' ? 'login' : 'register';
            let payload;
            if (mode === 'login') {
                payload = { identifier: loginWithEmail ? email : usn, password };
            } else {
                payload = { usn: loginWithEmail ? '' : usn, email: loginWithEmail ? email : '', role, password };
            }
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}`, payload);
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
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--black)', position: 'relative', overflow: 'hidden' }}>
            <div className="bg-noise"></div>
            <div className="shard shard-purple"></div>
            <div className="shard shard-purple-small" style={{ opacity: 0.1 }}></div>

            <div style={{ position: 'fixed', top: '40px', left: '40px', opacity: 0.2 }} className="monospaced caps">
                <div>SYS: AUTHGATE_ANVESHAN_V2.6</div>
                <div>SECURE CONNECTION: TRUE</div>
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
                style={{
                    width: '100%',
                    maxWidth: '450px',
                    padding: '60px 40px',
                    borderColor: 'rgba(255,255,255,0.1)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(30px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    zIndex: 10
                }}
            >
                <div className="card-metadata" style={{ color: 'var(--accent-purple)' }}>VER: 2.6.0-ALPHA</div>

                <h1 className="caps" style={{ marginBottom: '40px', fontSize: '2.5rem', letterSpacing: '0.1em', textAlign: 'center', fontWeight: 200 }}>
                    ANVESHAN<br /><span style={{ fontWeight: 800 }}>SIGN IN</span>
                </h1>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
                    <button
                        onClick={() => setMode('login')}
                        className={`caps ${mode === 'login' ? '' : 'opacity-60'}`}
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', background: mode === 'login' ? 'var(--accent-purple)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '10px' }}
                    > LOGIN </button>
                    <button
                        onClick={() => setMode('register')}
                        className={`caps ${mode === 'register' ? '' : 'opacity-60'}`}
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', background: mode === 'register' ? 'var(--accent-purple)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '10px' }}
                    > REGISTER </button>
                </div>

                <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => setLoginWithEmail(!loginWithEmail)}
                        className="monospaced caps"
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '8px 16px', borderRadius: '20px', fontSize: '10px', cursor: 'pointer' }}
                    >
                        {loginWithEmail ? '[ SWITCH TO USN ]' : "[ I DON'T HAVE A USN ]"}
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                        <label className="input-label">{loginWithEmail ? '"EMAIL ADDRESS"' : '"COLLEGE USN"'}</label>
                        {loginWithEmail ? (
                            <input
                                type="email"
                                className="input-industrial"
                                placeholder="SAMPLE: USER@EXAMPLE.COM"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        ) : (
                            <input
                                type="text"
                                className="input-industrial caps"
                                placeholder="SAMPLE: 1JSXXCSXXX"
                                value={usn}
                                onChange={(e) => setUsn(e.target.value.toUpperCase())}
                                required
                            />
                        )}
                    </div>

                    <div className="input-wrapper" style={{ marginTop: '20px', marginBottom: '20px' }}>
                        <label className="input-label">"PASSWORD"</label>
                        <input
                            type="password"
                            className="input-industrial"
                            placeholder="******"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            background: 'var(--accent-purple)',
                            color: 'var(--white)',
                            fontSize: '12px',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 20px rgba(120, 50, 255, 0.3)'
                        }}
                        disabled={loading}
                        data-ref="PROC_098"
                    >
                        {loading ? 'PROCESSING...' : (mode === 'login' ? 'ENTER ANVESHAN' : 'INITIALIZE ACCOUNT')}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
