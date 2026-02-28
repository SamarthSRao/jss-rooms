import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ShieldCheck, LogOut, Code, User, Menu, X, ArrowLeft } from 'lucide-react';

const Navbar = ({ user, setUser }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    // Lock body scroll when menu is open
    React.useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <>
            <nav className="fade-in" style={{
                borderBottom: '1px solid var(--border)',
                marginBottom: '40px',
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                zIndex: 1000,
                position: 'sticky',
                top: 0
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px' }}>
                    <Link to="/explore" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1002, position: 'relative' }}>
                        <div style={{
                            background: 'var(--accent-purple)',
                            padding: '6px',
                            borderRadius: '8px',
                            boxShadow: '0 0 15px rgba(120, 50, 255, 0.5)'
                        }}>
                            <Code size={18} color="white" />
                        </div>
                        <div>
                            <span className="caps" style={{ fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: 900 }}>
                                ANVESHAN
                            </span>
                            <div className="monospaced" style={{ fontSize: '8px', marginTop: '-2px', opacity: 0.6, letterSpacing: '0.2em' }}>2026 EDITION</div>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
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
                                style={{
                                    background: 'var(--accent-purple)',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    padding: '10px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 10px rgba(120, 50, 255, 0.3)'
                                }}
                            >
                                <LogOut size={14} strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ zIndex: 1002, position: 'relative', cursor: 'pointer' }}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </div>
                </div>
                <div className="cross-hatch" style={{ height: '4px', width: '100%', opacity: 0.3 }}></div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-content">
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            marginBottom: '32px',
                            padding: 0
                        }}
                    >
                        <ArrowLeft size={16} />
                        <span className="monospaced caps" style={{ fontSize: '12px' }}>BACK</span>
                    </button>

                    <Link to="/explore" onClick={() => setIsMenuOpen(false)} className="mobile-link">
                        "EXPLORE"
                    </Link>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="mobile-link">
                        "PROFILE"
                    </Link>
                    {user.role === 'admin' && (
                        <>
                            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="mobile-link" style={{ color: 'var(--safety-yellow)' }}>
                                "ADMIN"
                            </Link>
                            <Link to="/admin/checkin" onClick={() => setIsMenuOpen(false)} className="mobile-link" style={{ color: 'var(--blueprint-blue)' }}>
                                "CHECK_IN"
                            </Link>
                        </>
                    )}

                    <div className="mobile-divider"></div>

                    <div className="mobile-user-info" onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>
                        <div className="monospaced caps" style={{ fontSize: '14px', fontWeight: '900' }}>ID: {user.usn}</div>
                        <div className="monospaced" style={{ fontSize: '10px', opacity: 0.6 }}>{user.role === 'admin' ? 'LVL.ADMIN' : 'LVL.USER'}</div>
                    </div>

                    <button
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                        className="btn-industrial"
                        style={{ marginTop: '20px', width: '100%', justifyContent: 'center', background: 'var(--safety-orange)', color: 'black', border: 'none' }}
                    >
                        LOGOUT <LogOut size={16} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default Navbar;
