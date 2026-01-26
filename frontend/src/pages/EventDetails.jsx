import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, Users, ArrowLeft, Shield, Ticket } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const EventDetails = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        fetchData();
        checkRegistration();

        const pollInterval = setInterval(() => {
            const token = localStorage.getItem('token');
            if (token) {
                checkRegistration();
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(pollInterval);
    }, [id]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/events`);
            const found = response.data.find(e => e.id === id);
            setEvent(found);
        } catch (err) {
            console.error('Error fetching event', err);
        } finally {
            setLoading(false);
        }
    };

    const checkRegistration = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await axios.get(`${API_BASE_URL}/events/registrations`, {
                    headers: { Authorization: token }
                });
                const reg = response.data.find(r => r.event_id === id);
                setRegistration(reg);
            }
        } catch (err) {
            console.error('Error checking registration', err);
        }
    };

    const handleRegister = async () => {
        setRegistering(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/events/register`, { event_id: id }, {
                headers: { Authorization: token }
            });
            await checkRegistration();
        } catch (err) {
            alert(err.response?.data || "REGISTRATION_FAILED");
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return (
        <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
            LOADING...
        </div>
    );

    if (!event) return (
        <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
            <h1 style={{ fontSize: '2rem', textTransform: 'uppercase' }}>EVENT_NOT_FOUND</h1>
            <button onClick={() => navigate('/explore')} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}>BACK TO EXPLORE</button>
        </div>
    );

    const isRegistered = !!registration;

    return (
        <div style={{
            background: '#000',
            color: '#fff',
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
            padding: '40px 20px'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{ marginBottom: '40px' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff',
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '700',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginBottom: '20px'
                        }}
                    >
                        <ArrowLeft size={14} /> "BACK"
                    </button>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }}>
                    <div className="responsive-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
                        {/* Main Event Content */}
                        <div className="responsive-main-col" style={{ gridColumn: 'span 2' }}>
                            <div style={{
                                border: '1px solid rgba(255,255,255,0.2)',
                                overflow: 'hidden',
                                borderBottom: '8px solid #fff'
                            }}>
                                <div className="responsive-hero-section" style={{
                                    height: '400px',
                                    width: '100%',
                                    position: 'relative',
                                    background: '#0a0a0a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {event.image_url ? (
                                        <img src={event.image_url} alt={event.title} style={{ width: '100%', height: '100%', objectCover: 'cover', opacity: 0.5, position: 'absolute' }} />
                                    ) : (
                                        <>
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)',
                                                opacity: 0.3
                                            }}></div>
                                            <Ticket size={120} style={{ opacity: 0.1 }} />
                                        </>
                                    )}

                                    <div className="responsive-hero-padding" style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        width: '100%',
                                        padding: '48px',
                                        background: 'linear-gradient(to top, #000, rgba(0,0,0,0.8), transparent)'
                                    }}>
                                        <span style={{
                                            background: '#fff',
                                            color: '#000',
                                            padding: '4px 12px',
                                            fontSize: '10px',
                                            fontWeight: '900',
                                            letterSpacing: '0.15em',
                                            display: 'inline-block',
                                            marginBottom: '16px'
                                        }}>{event.category}</span>
                                        <h1 className="responsive-title" style={{
                                            fontSize: '3.5rem',
                                            letterSpacing: '-0.04em',
                                            lineHeight: 0.9,
                                            fontWeight: '900',
                                            textTransform: 'uppercase'
                                        }}>
                                            "{event.title}"
                                        </h1>
                                    </div>
                                </div>

                                <div className="responsive-content" style={{ padding: '60px' }}>
                                    <div className="responsive-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '48px', marginBottom: '64px' }}>
                                        <div>
                                            <div style={{ fontSize: '9px', opacity: 0.4, letterSpacing: '0.2em', marginBottom: '16px', textTransform: 'uppercase', fontFamily: 'monospace' }}>WHEN</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                                <div style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)' }}>
                                                    <Calendar size={24} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase' }}>
                                                        {new Date(event.event_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                                    </div>
                                                    <div style={{ fontSize: '12px', opacity: 0.6, fontFamily: 'monospace' }}>
                                                        {new Date(event.event_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '9px', opacity: 0.4, letterSpacing: '0.2em', marginBottom: '16px', textTransform: 'uppercase', fontFamily: 'monospace' }}>WHERE</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                                <div style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)' }}>
                                                    <MapPin size={24} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase' }}>{event.location}</div>
                                                    <div style={{ fontSize: '12px', opacity: 0.6, fontFamily: 'monospace' }}>JSS_SECURE_ZONE</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '9px', opacity: 0.4, letterSpacing: '0.2em', marginBottom: '24px', textTransform: 'uppercase', fontFamily: 'monospace' }}>ABOUT</div>
                                        <p style={{
                                            opacity: 0.8,
                                            lineHeight: 1.8,
                                            fontSize: '18px',
                                            borderLeft: '2px solid #fff',
                                            paddingLeft: '32px',
                                            margin: 0
                                        }}>
                                            {event.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Registration Sidecard */}
                        <div>
                            <div style={{ position: 'sticky', top: '48px' }}>
                                <div className="responsive-sidecard" style={{
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    padding: '48px',
                                    textAlign: 'center',
                                    marginBottom: '32px'
                                }}>
                                    <div style={{
                                        fontSize: '9px',
                                        opacity: 0.4,
                                        letterSpacing: '0.2em',
                                        marginBottom: '32px',
                                        fontFamily: 'monospace'
                                    }}>
                                        ID: {isRegistered ? 'CONFIRMED' : 'WAITING'}
                                    </div>

                                    {!isRegistered ? (
                                        <>
                                            <h3 style={{ fontSize: '24px', marginBottom: '48px', fontWeight: '900', textTransform: 'uppercase' }}>
                                                "GET_ACCESS"
                                            </h3>
                                            <div style={{ marginBottom: '64px', textAlign: 'left' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '32px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '9px', opacity: 0.4, letterSpacing: '0.15em', fontFamily: 'monospace', marginBottom: '8px' }}>CAPACITY</div>
                                                        <div style={{ fontWeight: '700', textTransform: 'uppercase' }}>{event.capacity}</div>
                                                    </div>
                                                    <Users size={20} style={{ opacity: 0.2 }} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '9px', opacity: 0.4, letterSpacing: '0.15em', fontFamily: 'monospace', marginBottom: '8px' }}>STATUS</div>
                                                        <div style={{ fontWeight: '700', textTransform: 'uppercase', color: '#22c55e' }}>AVAILABLE</div>
                                                    </div>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }}></div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleRegister}
                                                disabled={registering}
                                                style={{
                                                    background: '#fff',
                                                    color: '#000',
                                                    border: 'none',
                                                    padding: '24px',
                                                    width: '100%',
                                                    fontSize: '18px',
                                                    fontWeight: '900',
                                                    textTransform: 'uppercase',
                                                    cursor: registering ? 'not-allowed' : 'pointer',
                                                    opacity: registering ? 0.6 : 1
                                                }}
                                            >
                                                {registering ? '...WAIT' : '"REGISTER NOW"'}
                                            </button>
                                        </>
                                    ) : registration.status === 'checked_in' ? (
                                        <div>
                                            <div style={{
                                                background: '#22c55e',
                                                color: '#000',
                                                padding: '4px 12px',
                                                fontSize: '12px',
                                                fontWeight: '900',
                                                letterSpacing: '0.15em',
                                                display: 'inline-block',
                                                marginBottom: '40px'
                                            }}>CONFIRMED</div>
                                            <h3 style={{ fontSize: '24px', marginBottom: '48px', fontWeight: '900', textTransform: 'uppercase' }}>
                                                "ENTRY_GRANTED"
                                            </h3>

                                            <div style={{
                                                background: '#fff',
                                                padding: '40px 16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '40px',
                                                boxShadow: '0 0 40px -10px rgba(34, 197, 94, 0.3)',
                                                border: '2px solid #22c55e'
                                            }}>
                                                <div style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '50%',
                                                    background: '#22c55e',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: '24px'
                                                }}>
                                                    <Shield size={40} color="#000" />
                                                </div>
                                                <div style={{ color: '#000', fontWeight: '900', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                    CHECKED IN
                                                </div>
                                            </div>

                                            <div style={{
                                                fontSize: '10px',
                                                opacity: 0.4,
                                                marginBottom: '40px',
                                                textAlign: 'left',
                                                borderLeft: '1px solid rgba(255,255,255,0.2)',
                                                paddingLeft: '16px',
                                                paddingTop: '8px',
                                                paddingBottom: '8px',
                                                fontFamily: 'monospace'
                                            }}>
                                                USER: {user?.usn || 'UNKNOWN'}<br />
                                                ENTRY_TIME: {registration.checked_in_at ? new Date(registration.checked_in_at).toLocaleTimeString() : 'JUST NOW'}<br />
                                                STATUS: VERIFIED
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{
                                                background: '#facc15',
                                                color: '#000',
                                                padding: '4px 12px',
                                                fontSize: '12px',
                                                fontWeight: '900',
                                                letterSpacing: '0.15em',
                                                display: 'inline-block',
                                                marginBottom: '40px'
                                            }}>AUTHORIZED</div>
                                            <h3 style={{ fontSize: '24px', marginBottom: '48px', fontWeight: '900', textTransform: 'uppercase' }}>
                                                "ACCESS_TOKEN"
                                            </h3>

                                            <div style={{
                                                background: '#fff',
                                                padding: '16px',
                                                display: 'inline-block',
                                                marginBottom: '40px',
                                                boxShadow: '0 0 40px -10px rgba(255,255,255,0.3)'
                                            }}>
                                                <div style={{
                                                    width: '220px',
                                                    height: '220px',
                                                    background: '#000',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '10px',
                                                    color: '#fff',
                                                    textAlign: 'center',
                                                    padding: '0',
                                                    fontFamily: 'monospace',
                                                    wordBreak: 'break-all'
                                                }}>
                                                    <QRCodeSVG
                                                        value={registration.qr_code_token}
                                                        size={200}
                                                        level="H"
                                                        includeMargin={true}
                                                        bgColor="#000000"
                                                        fgColor="#FFFFFF"
                                                    />
                                                </div>
                                            </div>

                                            <div style={{
                                                fontSize: '10px',
                                                opacity: 0.4,
                                                marginBottom: '40px',
                                                textAlign: 'left',
                                                borderLeft: '1px solid rgba(255,255,255,0.2)',
                                                paddingLeft: '16px',
                                                paddingTop: '8px',
                                                paddingBottom: '8px',
                                                fontFamily: 'monospace'
                                            }}>
                                                USER: {user?.usn || 'UNKNOWN'}<br />
                                                ISSUED: {new Date(registration.CreatedAt).toLocaleDateString()}<br />
                                                QTK: {registration.qr_code_token.substring(0, 15)}...
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', color: '#22c55e', fontSize: '12px', fontWeight: '900', fontFamily: 'monospace' }}>
                                                <Shield size={16} /> SECURITY_VALIDATED
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    padding: '32px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontFamily: 'monospace',
                                    fontSize: '9px',
                                    lineHeight: 1.6,
                                    opacity: 0.4
                                }}>
                                    BY REGISTERING, YOU AGREE TO FOLLOW ALL CAMPUS PROTOCOLS AT THE VENUE. ENTRY IS SUBJECT TO CAPACITY LIMITS EVEN WITH A TOKEN.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                @media (max-width: 768px) {
                    .responsive-grid-container {
                        display: flex !important;
                        flex-direction: column;
                        gap: 32px !important;
                    }
                    .responsive-main-col {
                        grid-column: auto !important;
                    }
                    .responsive-hero-section {
                        height: 250px !important;
                    }
                    .responsive-hero-padding {
                        padding: 24px !important;
                    }
                    .responsive-title {
                        font-size: 2rem !important;
                    }
                    .responsive-content {
                        padding: 24px !important;
                    }
                    .responsive-meta-grid {
                        gap: 24px !important;
                        margin-bottom: 32px !important;
                    }
                    .responsive-sidecard {
                        padding: 24px !important;
                    }
                }
            `}</style>
            </div>
        </div>
    );
};

export default EventDetails;
