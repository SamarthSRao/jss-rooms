import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Compass, UserCircle, LogOut, ShieldCheck } from 'lucide-react';

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <nav style={{ padding: '20px 0', borderBottom: '1px solid var(--border)', marginBottom: '40px' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/explore" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '8px' }}>
                        <Home size={20} />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>JSS Rooms</span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <Link to="/explore" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Compass size={18} /> Explore
                    </Link>

                    {user.role === 'admin' && (
                        <Link to="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={18} /> Admin
                        </Link>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid var(--border)', paddingLeft: '32px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600' }}>{user.usn}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.role === 'admin' ? 'Administrator' : 'Student'}</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
