import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ShieldCheck, LogOut, Code, User } from 'lucide-react';

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <nav className="fade-in" style={{ borderBottom: '1px solid var(--border)', marginBottom: '40px', background: 'var(--black)', zIndex: 1000, position: 'relative' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px' }}>
                <Link to="/explore" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: 'var(--white)', padding: '4px', border: '1px solid var(--white)' }}>
                        <Code size={18} color="black" />
                    </div>
                    <div>
                        <span className="caps" style={{ fontSize: '1.4rem', letterSpacing: '-0.04em' }}>
                            "JSS ROOMS"
                        </span>
                        <div className="monospaced" style={{ fontSize: '7px', marginTop: '-4px', opacity: 0.5 }}>©2026 FOR DISPLAY ONLY</div>
                    </div>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <Link to="/explore" className="caps hover-glitch" style={{ color: 'var(--white)', textDecoration: 'none', fontSize: '11px', letterSpacing: '0.1em' }}>
                        "EXPLORE"
                    </Link>

                    <Link to="/profile" className="caps hover-glitch" style={{ color: 'var(--white)', textDecoration: 'none', fontSize: '11px', letterSpacing: '0.1em' }}>
                        "PROFILE"
                    </Link>

                    {user.role === 'admin' && (
                        <>
                            <Link to="/admin" className="caps hover-glitch" style={{ color: 'var(--safety-yellow)', textDecoration: 'none', fontSize: '11px', letterSpacing: '0.1em' }}>
                                "ADMIN"
                                <span className="tag-zip" style={{ background: 'var(--safety-yellow)', fontSize: '8px' }}>MASTER</span>
                            </Link>
                            <Link to="/admin/checkin" className="caps hover-glitch" style={{ color: 'var(--blueprint-blue)', textDecoration: 'none', fontSize: '11px', letterSpacing: '0.1em' }}>
                                "CHECK_IN"
                            </Link>
                        </>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '1px solid var(--border)', paddingLeft: '32px' }}>
                        <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div className="monospaced caps" style={{ fontSize: '11px', fontWeight: '900' }}>ID: {user.usn}</div>
                                <div className="monospaced" style={{ fontSize: '8px', opacity: 0.6 }}>{user.role === 'admin' ? 'LVL.ADMIN' : 'LVL.USER'}</div>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="hover-glitch"
                            style={{ background: 'var(--safety-orange)', border: 'none', color: 'black', cursor: 'pointer', padding: '8px' }}
                        >
                            <LogOut size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="cross-hatch" style={{ height: '4px', width: '100%', opacity: 0.3 }}></div>
        </nav>
    );
};

export default Navbar;
