import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, Users, ArrowLeft, Shield, Ticket, Zap, Share2, MoreHorizontal, Mail, Plus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const ActivityDetails = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activity, setActivity] = useState(null);
    const [parentEvent, setParentEvent] = useState(null);
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [additionalUSNs, setAdditionalUSNs] = useState(['', '', '', '']);
    const [showUSNInputs, setShowUSNInputs] = useState(false);
    const [registrationMessage, setRegistrationMessage] = useState(null); // { type: 'success' | 'error', text: string | JSX }

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
            const [activitiesRes, eventsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/activities`),
                axios.get(`${API_BASE_URL}/events`)
            ]);

            const foundActivity = activitiesRes.data.find(a => a.id === id);
            setActivity(foundActivity);

            if (foundActivity && foundActivity.event_id) {
                const foundEvent = eventsRes.data.find(e => e.id === foundActivity.event_id);
                setParentEvent(foundEvent);
            }
        } catch (err) {
            console.error('Error fetching data', err);
        } finally {
            setLoading(false);
        }
    };

    const checkRegistration = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Check user profile for activity registrations
                const response = await axios.get(`${API_BASE_URL}/profile`, {
                    headers: { Authorization: token }
                });
                const userProfile = response.data;
                const reg = userProfile.activity_registrations?.find(r => r.activity_id === id);
                setRegistration(reg);
            }
        } catch (err) {
            console.error('Error checking registration', err);
        }
    };

    const handleRegister = async () => {
        setRegistering(true);
        setRegistrationMessage(null);
        try {
            const token = localStorage.getItem('token');

            // Filter out empty strings from additionalUSNs
            const friends = additionalUSNs.filter(usn => usn.trim() !== '');
            const usnsToRegister = [user.usn, ...friends];

            const response = await axios.post(`${API_BASE_URL}/activities/register`, {
                activity_id: id,
                usns: usnsToRegister
            }, {
                headers: { Authorization: token }
            });

            if (response.data.errors && response.data.errors.length > 0) {
                setRegistrationMessage({
                    type: 'error',
                    text: (
                        <div>
                            <div>REGISTRATION COMPLETE WITH ERRORS:</div>
                            <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                                {response.data.errors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    )
                });
            } else if (response.data.registered_usns && response.data.registered_usns.length > 0) {
                setRegistrationMessage({
                    type: 'success',
                    text: (
                        <div>
                            <div>SUCCESSFULLY REGISTERED:</div>
                            <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                                {response.data.registered_usns.map((usn, i) => <li key={i}>{usn}</li>)}
                            </ul>
                        </div>
                    )
                });
            }

            await checkRegistration();
        } catch (err) {
            let msg = "REGISTRATION_FAILED";
            let details = [];

            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    msg = err.response.data;
                } else if (err.response.data.errors) {
                    msg = "FAILED TO REGISTER:";
                    details = err.response.data.errors;
                } else if (err.response.data.message) {
                    msg = err.response.data.message;
                }
            }

            setRegistrationMessage({
                type: 'error',
                text: (
                    <div>
                        <div>{msg}</div>
                        {details.length > 0 && (
                            <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                                {details.map((d, i) => <li key={i}>{d}</li>)}
                            </ul>
                        )}
                    </div>
                )
            });
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return (
        <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
            LOADING...
        </div>
    );

    if (!activity) return (
        <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
            <h1 style={{ fontSize: '2rem', textTransform: 'uppercase' }}>ACTIVITY_NOT_FOUND</h1>
            <button onClick={() => navigate('/explore')} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}>BACK TO EXPLORE</button>
        </div>
    );

    const isRegistered = !!registration;

    return (
        <div className="activity-page-root">
            <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>

                {/* DESKTOP HEADER */}
                <header className="desktop-header" style={{ marginBottom: '40px' }}>
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

                {/* MOBILE HEADER */}
                <div className="mobile-header">
                    <button onClick={() => navigate(-1)} className="mobile-icon-btn">
                        <ArrowLeft size={24} color="#fff" />
                    </button>
                    <button className="mobile-icon-btn">
                        <Share2 size={24} color="#fff" />
                    </button>
                </div>

                <div className="layout-grid">
                    <div className="main-content">
                        {/* HERO SECTION */}
                        <div className="hero-container">
                            <div className="hero-image-wrapper">
                                {activity.image_url ? (
                                    <img src={activity.image_url} alt={activity.title} className="hero-img" />
                                ) : (
                                    <div className="hero-placeholder">
                                        <div className="hero-placeholder-overlay"></div>
                                        <Ticket size={120} style={{ opacity: 0.1 }} />
                                    </div>
                                )}

                                {/* DESKTOP TITLE OVERLAY */}
                                <div className="desktop-hero-overlay">
                                    <h1 className="hero-title">"{activity.title}"</h1>
                                    <br />
                                    {parentEvent && (
                                        <span className="hero-tag">EVENT: {parentEvent.title}</span>
                                    )}
                                </div>
                            </div>

                            {/* MOBILE TITLE SECTION (Below Image) */}
                            <div className="mobile-title-section">
                                <div className="mobile-category">
                                    <Zap size={12} fill="var(--safety-orange)" color="var(--safety-orange)" />
                                    <span>{activity.category || 'EVENT'}</span>
                                </div>
                                <h1 className="mobile-title">{activity.title}</h1>
                                <div className="mobile-date">
                                    {new Date(activity.start_time).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}, {new Date(activity.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            {/* MOBILE ACTION ROW */}
                            <div className="mobile-action-row">
                                <button className="mobile-action-btn primary" onClick={isRegistered ? () => { } : handleRegister} disabled={registering}>
                                    <div className="icon-box primary">
                                        {isRegistered ? <Ticket size={24} /> : <Plus size={24} />}
                                    </div>
                                    <span>{isRegistered ? "Ticket" : "Register"}</span>
                                </button>
                                <button className="mobile-action-btn">
                                    <div className="icon-box">
                                        <Mail size={24} />
                                    </div>
                                    <span>Contact</span>
                                </button>
                                <button className="mobile-action-btn">
                                    <div className="icon-box">
                                        <Share2 size={24} />
                                    </div>
                                    <span>Share</span>
                                </button>
                                <button className="mobile-action-btn">
                                    <div className="icon-box">
                                        <MoreHorizontal size={24} />
                                    </div>
                                    <span>More</span>
                                </button>
                            </div>

                            {/* MOBILE GROUP REGISTRATION (Visible only if NOT registered) */}
                            {!isRegistered && (
                                <div className="mobile-group-reg">
                                    <button
                                        className="m-group-toggle"
                                        onClick={() => setShowUSNInputs(!showUSNInputs)}
                                    >
                                        {showUSNInputs ? "Remove Guests" : "Add Guests (Optional)"}
                                    </button>

                                    {showUSNInputs && (
                                        <div className="m-group-inputs">
                                            {additionalUSNs.map((usn, idx) => (
                                                <input
                                                    key={idx}
                                                    type="text"
                                                    placeholder={`Friend USN #${idx + 1}`}
                                                    value={usn}
                                                    onChange={(e) => {
                                                        const newUSNs = [...additionalUSNs];
                                                        newUSNs[idx] = e.target.value;
                                                        setAdditionalUSNs(newUSNs);
                                                    }}
                                                    className="m-usn-input"
                                                />
                                            ))}
                                            <div className="m-note">* You and your friends will be registered together.</div>
                                        </div>
                                    )}

                                    {registrationMessage && (
                                        <div className={`m-reg-message ${registrationMessage.type}`}>
                                            {registrationMessage.text}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* MOBILE TICKET SECTION (Visible only if registered) */}
                            {isRegistered && (
                                <div className="mobile-ticket-section">
                                    <div className="mobile-ticket-card">
                                        <div className="m-ticket-header">
                                            <span>ACCESS PASS</span>
                                            <div className="m-status-dot"></div>
                                        </div>
                                        <div className="m-qr-container">
                                            <QRCodeSVG
                                                value={registration.qr_code_token || registration.id}
                                                size={160}
                                                level="H"
                                                bgColor="transparent"
                                                fgColor="#fff"
                                            />
                                        </div>
                                        <div className="m-ticket-details">
                                            <div className="m-user-usn">{user?.usn || 'USER'}</div>
                                            <div className="m-ticket-id">#{(registration.qr_code_token || registration.id).substring(0, 8).toUpperCase()}</div>
                                        </div>
                                        <div className="m-ticket-footer">
                                            <Shield size={16} /> VALIDATED ENTRY
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="content-padding">
                                <div className="meta-grid">
                                    {/* Only show Date/Where on Desktop as Mobile has it elsewhere or differently styled */}
                                    <div className="desktop-meta-item">
                                        <div className="meta-label">WHEN</div>
                                        <div className="meta-value-row">
                                            <div className="meta-icon-box">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <div className="meta-main-text">
                                                    {new Date(activity.start_time).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                                </div>
                                                <div className="meta-sub-text">
                                                    {new Date(activity.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="desktop-meta-item mobile-location-item">
                                        <div className="meta-label">Location</div>
                                        <div className="meta-value-row">
                                            <div className="meta-icon-box">
                                                <MapPin size={24} />
                                            </div>
                                            <div>
                                                <div className="meta-main-text">{activity.location || 'TBA'}</div>
                                                <div className="meta-sub-text">CAMPUS LOCATION</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="meta-label">ABOUT ACTIVITY</div>
                                    <p className="description-text">
                                        {activity.description || "No description available."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SIDECARD (Desktop Registration) - Hidden on mobile if needed, or repurposed */}
                    <div className="sidecard-col">
                        <div className="sticky-wrapper">
                            <div className="sidecard">
                                <div className="sidecard-header">
                                    ID: {isRegistered ? 'CONFIRMED' : 'WAITING'}
                                </div>

                                {!isRegistered ? (
                                    <>
                                        <h3 className="sidecard-title">"JOIN_ACTIVITY"</h3>
                                        <div className="status-row">
                                            <div>
                                                <div className="status-label">STATUS</div>
                                                <div className="status-val">OPEN</div>
                                            </div>
                                            <div className="status-dot"></div>
                                        </div>

                                        <div className="group-reg-wrapper">
                                            <button
                                                onClick={() => setShowUSNInputs(!showUSNInputs)}
                                                className="group-reg-toggle"
                                            >
                                                {showUSNInputs ? "- REMOVE GROUP MEMBERS" : "+ ADD UP TO 4 FRIENDS (USN)"}
                                            </button>

                                            {showUSNInputs && (
                                                <div className="group-inputs">
                                                    {additionalUSNs.map((usn, idx) => (
                                                        <input
                                                            key={idx}
                                                            type="text"
                                                            placeholder={`FRIEND'S USN #${idx + 1}`}
                                                            value={usn}
                                                            onChange={(e) => {
                                                                const newUSNs = [...additionalUSNs];
                                                                newUSNs[idx] = e.target.value;
                                                                setAdditionalUSNs(newUSNs);
                                                            }}
                                                            className="usn-input"
                                                        />
                                                    ))}
                                                    <div className="group-note">* YOU WILL ALSO BE REGISTERED AUTOMATICALLY</div>
                                                </div>
                                            )}
                                        </div>

                                        {registrationMessage && (
                                            <div className={`reg-message ${registrationMessage.type}`}>
                                                {registrationMessage.text}
                                            </div>
                                        )}

                                        <div className="reg-btn-wrapper">
                                            <button
                                                onClick={handleRegister}
                                                disabled={registering}
                                                className="reg-btn"
                                            >
                                                {registering ? '...WAIT' : '"REGISTER NOW"'}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <div className="auth-badge">AUTHORIZED</div>
                                        <h3 className="sidecard-title">"ACCESS_ID"</h3>

                                        <div className="qr-wrapper">
                                            <div className="qr-box">
                                                <QRCodeSVG
                                                    value={registration.qr_code_token || registration.id}
                                                    size={200}
                                                    level="H"
                                                    includeMargin={true}
                                                    bgColor="#000000"
                                                    fgColor="#FFFFFF"
                                                />
                                            </div>
                                        </div>

                                        <div className="user-details">
                                            USER: {user?.usn || 'UNKNOWN'}<br />
                                            ISSUED: {new Date(registration.CreatedAt || registration.created_at).toLocaleDateString()}<br />
                                            ID: {(registration.qr_code_token || registration.id).substring(0, 15)}...
                                        </div>

                                        <div className="validated-badge">
                                            <Shield size={16} /> SECURITY_VALIDATED
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="disclaimer-box">
                                BY REGISTERING, YOU AGREE TO FOLLOW ALL CAMPUS PROTOCOLS AT THE VENUE. MAKE SURE TO ATTEND ON TIME.
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                .activity-page-root {
                    background: #000;
                    color: #fff;
                    min-height: 100vh;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
                    padding: 40px 20px;
                }
                
                .mobile-header, .mobile-title-section, .mobile-action-row, .mobile-group-reg {
                    display: none;
                }

                .layout-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 48px;
                }

                .responsive-grid-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 48px;
                }
                
                @media (min-width: 1024px) {
                    .layout-grid {
                         grid-template-columns: 2fr 1fr;
                    }
                }

                .hero-container {
                    border: 1px solid rgba(255,255,255,0.2);
                    overflow: hidden;
                    border-bottom: 8px solid #fff;
                }

                .hero-image-wrapper {
                    height: 400px;
                    width: 100%;
                    position: relative;
                    background: #0a0a0a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .hero-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0.5;
                    position: absolute;
                }

                .hero-placeholder {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .hero-placeholder-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    opacity: 0.3;
                    background: #222;
                }

                .desktop-hero-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    padding: 48px;
                    background: linear-gradient(to top, #000, rgba(0,0,0,0.8), transparent);
                }

                .hero-title {
                    font-size: 3.5rem;
                    letter-spacing: -0.04em;
                    line-height: 0.9;
                    font-weight: 900;
                    text-transform: uppercase;
                }

                .hero-tag {
                    background: #fff;
                    color: #000;
                    padding: 8px 18px;
                    font-size: 20px;
                    font-weight: 900;
                    letter-spacing: 0.35em;
                    display: inline-block;
                    margin-bottom: 16px;
                }

                .content-padding {
                    padding: 60px;
                }

                .meta-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 48px;
                    margin-bottom: 64px;
                }

                .meta-label {
                    font-size: 9px;
                    opacity: 0.4;
                    letter-spacing: 0.2em;
                    margin-bottom: 16px;
                    text-transform: uppercase;
                    font-family: monospace;
                }

                .meta-value-row {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }

                .meta-icon-box {
                    padding: 16px;
                    border: 1px solid rgba(255,255,255,0.2);
                    background: rgba(255,255,255,0.05);
                }

                .meta-main-text {
                    font-size: 20px;
                    font-weight: 900;
                    text-transform: uppercase;
                }

                .meta-sub-text {
                    font-size: 12px;
                    opacity: 0.6;
                    font-family: monospace;
                }

                .description-text {
                    opacity: 0.8;
                    line-height: 1.8;
                    font-size: 18px;
                    border-left: 2px solid #fff;
                    padding-left: 32px;
                    margin: 0;
                }

                /* SIDECARD STYLES */
                .sidecard {
                    border: 1px solid rgba(255,255,255,0.2);
                    padding: 48px;
                    text-align: center;
                    margin-bottom: 32px;
                }

                .sidecard-header {
                    font-size: 9px;
                    opacity: 0.4;
                    letter-spacing: 0.2em;
                    margin-bottom: 32px;
                    font-family: monospace;
                }
                
                .sidecard-title {
                    font-size: 24px;
                    margin-bottom: 48px;
                    font-weight: 900;
                    text-transform: uppercase;
                }

                .status-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    padding-bottom: 16px;
                    margin-bottom: 64px;
                    text-align: left;
                }

                .status-label {
                    font-size: 9px;
                    opacity: 0.4;
                    letter-spacing: 0.15em;
                    font-family: monospace;
                    margin-bottom: 8px;
                }

                .status-val {
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #22c55e;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #22c55e;
                    animation: pulse 2s infinite;
                }

                .group-reg-toggle {
                    background: transparent;
                    border: 1px dashed rgba(255,255,255,0.3);
                    color: #aaa;
                    padding: 12px;
                    width: 100%;
                    font-size: 11px;
                    margin-bottom: 16px;
                    cursor: pointer;
                    font-family: monospace;
                }

                .usn-input {
                    background: #18181b;
                    border: 1px solid rgba(255,255,255,0.2);
                    color: #fff;
                    padding: 10px;
                    font-size: 12px;
                    font-family: monospace;
                    text-transform: uppercase;
                }
                
                .group-inputs {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    animation: fadeIn 0.3s ease;
                }

                .group-note {
                    font-size: 9px;
                    opacity: 0.5;
                    margin-top: 4px;
                    font-style: italic;
                }
                
                .reg-message {
                    margin-bottom: 24px;
                    padding: 16px;
                    color: #fff;
                    font-size: 11px;
                    font-family: monospace;
                    text-align: left;
                    line-height: 1.5;
                }
                .reg-message.success { background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; }
                .reg-message.error { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; }

                .reg-btn {
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 24px;
                    width: 100%;
                    font-size: 18px;
                    font-weight: 900;
                    text-transform: uppercase;
                    cursor: pointer;
                }
                .reg-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .disclaimer-box {
                    padding: 32px;
                    border: 1px solid rgba(255,255,255,0.1);
                    font-family: monospace;
                    font-size: 9px;
                    line-height: 1.6;
                    opacity: 0.4;
                }
                
                .auth-badge {
                    background: #facc15;
                    color: #000;
                    padding: 4px 12px;
                    font-size: 12px;
                    font-weight: 900;
                    letter-spacing: 0.15em;
                    display: inline-block;
                    margin-bottom: 40px;
                }
                
                .qr-wrapper {
                    background: #fff;
                    padding: 16px;
                    display: inline-block;
                    margin-bottom: 40px;
                    box-shadow: 0 0 40px -10px rgba(255,255,255,0.3);
                }
                
                .qr-box {
                    width: 220px;
                    height: 220px;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    color: #fff;
                    text-align: center;
                    padding: 0;
                    font-family: monospace;
                    word-break: break-all;
                }
                
                .user-details {
                    font-size: 10px;
                    opacity: 0.4;
                    margin-bottom: 40px;
                    text-align: left;
                    border-left: 1px solid rgba(255,255,255,0.2);
                    padding-left: 16px;
                    padding-top: 8px;
                    padding-bottom: 8px;
                    font-family: monospace;
                }
                
                .validated-badge {
                    display: flex; 
                    align-items: center; 
                    gap: 12px; 
                    justify-content: center; 
                    color: #22c55e; 
                    font-size: 12px; 
                    font-weight: 900; 
                    font-family: monospace;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .mobile-ticket-section {
                    display: none;
                }

                /* MOBILE OVERRIDES */
                @media (max-width: 768px) {
                    .activity-page-root {
                        padding: 0 !important; /* Full width mobile */
                        background: #000;
                    }
                    .container { margin: 0 !important; }

                    .desktop-header, .desktop-meta-item:not(.mobile-location-item), .sidecard-col, .desktop-hero-overlay {
                        display: none !important;
                    }

                    .mobile-header {
                        display: flex;
                        justify-content: space-between;
                        padding: 15px 20px;
                        margin-bottom: 10px;
                    }

                    .mobile-icon-btn {
                        background: rgba(255,255,255,0.1);
                        border: none;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                    }

                    /* Hero Image Card style on mobile */
                    .hero-container {
                        border: none !important;
                        border-bottom: none !important;
                        margin: 0 10px;
                        border-radius: 20px;
                        overflow: hidden;
                        height: auto;
                    }
                    .hero-image-wrapper {
                         height: 350px !important;
                         border-radius: 20px;
                    }
                    .hero-img {
                        opacity: 1 !important; /* Brighter on mobile */
                    }

                    /* Mobile Title Section */
                    .mobile-title-section {
                        display: block;
                        padding: 20px 20px 10px;
                    }
                    .mobile-category {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        color: var(--safety-orange);
                        font-size: 12px;
                        font-weight: 700;
                        margin-bottom: 8px;
                        text-transform: uppercase;
                    }
                    .mobile-title {
                        font-size: 2rem;
                        font-weight: 800;
                        line-height: 1.1;
                        margin-bottom: 8px;
                        text-transform: none; /* Reference image style - Camel/Title Case usually inside, but industrial stays caps */
                        text-transform: uppercase;
                    }
                    .mobile-date {
                        color: #aaa;
                        font-family: monospace;
                        font-size: 14px;
                    }

                    /* Action Row */
                    .mobile-action-row {
                        display: flex;
                        justify-content: space-between; /* Space out buttons */
                        padding: 20px;
                        gap: 10px;
                    }
                    
                    .mobile-action-btn {
                        background: transparent;
                        border: none;
                        color: #fff;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                        font-size: 10px;
                        opacity: 0.8;
                        flex: 1; /* Distribute evenly */
                    }
                    
                    .mobile-action-btn.primary {
                        opacity: 1;
                        color: #000;
                    }

                    .icon-box {
                        width: 50px;
                        height: 50px;
                        border-radius: 12px;
                        background: rgba(255,255,255,0.1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: transform 0.1s;
                    }
                    .icon-box.primary {
                        background: #fff;
                        color: #000;
                    }
                    .mobile-action-btn:active .icon-box {
                        transform: scale(0.95);
                    }


                    .mobile-ticket-section {
                        display: none;
                    }

                    /* Content Padding adjustment */
                    .content-padding {
                        padding: 0 20px 40px !important;
                    }
                    
                    .meta-grid {
                        margin-bottom: 24px !important;
                         display: block !important;
                    }
                    .mobile-location-item {
                         margin-top: 20px;
                    }
                    .meta-label {
                         margin-bottom: 8px !important;
                    }
                    .meta-value-row {
                         gap: 16px !important;
                    }
                    .meta-icon-box {
                         padding: 12px !important;
                         border-radius: 8px;
                    }


                    /* Mobile Group Registration Styles */
                    .mobile-group-reg {
                        padding: 0 20px 20px;
                        margin-top: -10px;
                        animation: fadeIn 0.3s ease;
                    }
                    .m-group-toggle {
                        background: rgba(255,255,255,0.05);
                        border: 1px dashed rgba(255,255,255,0.2);
                        color: #aaa;
                        width: 100%;
                        padding: 12px;
                        border-radius: 12px;
                        font-size: 11px;
                        font-family: monospace;
                        margin-bottom: 12px;
                        cursor: pointer;
                    }
                    .m-group-inputs {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        margin-bottom: 16px;
                    }
                    .m-usn-input {
                        width: 100%;
                        background: #111;
                        border: 1px solid rgba(255,255,255,0.15);
                        color: #fff;
                        padding: 12px;
                        border-radius: 12px;
                        font-size: 13px;
                        font-family: monospace;
                        text-transform: uppercase;
                    }
                    .m-usn-input:focus {
                        outline: none;
                        border-color: var(--safety-orange, #ff5f1f);
                    }
                    .m-note {
                        font-size: 10px;
                        color: #666;
                        font-style: italic;
                    }
                    .m-reg-message {
                        padding: 12px;
                        border-radius: 8px;
                        font-size: 11px;
                        font-family: monospace;
                        margin-bottom: 12px;
                    }
                    .m-reg-message.success {
                        background: rgba(34, 197, 94, 0.1);
                        border: 1px solid #22c55e;
                        color: #22c55e;
                    }
                    .m-reg-message.error {
                        background: rgba(239, 68, 68, 0.1);
                        border: 1px solid #ef4444;
                        color: #ef4444;
                    }


                    /* Mobile Ticket Styles */
                    .mobile-ticket-section {
                        display: block;
                        padding: 0 20px 30px;
                    }
                    .mobile-ticket-card {
                        background: linear-gradient(135deg, #18181b 0%, #000 100%);
                        border: 1px solid rgba(255,255,255,0.2);
                        border-radius: 20px;
                        padding: 30px;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
                    }
                    .mobile-ticket-card::before {
                        content: '';
                        position: absolute;
                        top: 0; left: 0; right: 0; height: 6px;
                        background: var(--safety-orange, #ff5f1f);
                    }
                    .m-ticket-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-family: monospace;
                        font-size: 12px;
                        letter-spacing: 0.1em;
                        color: #aaa;
                        margin-bottom: 30px;
                        border-bottom: 1px dashed rgba(255,255,255,0.1);
                        padding-bottom: 15px;
                    }
                    .m-status-dot {
                        width: 8px;
                        height: 8px;
                        background: #22c55e;
                        border-radius: 50%;
                        box-shadow: 0 0 10px #22c55e;
                    }
                    .m-qr-container {
                        background: #fff;
                        padding: 15px;
                        border-radius: 12px;
                        display: inline-block;
                        margin-bottom: 25px;
                    }
                    .m-ticket-details {
                        margin-bottom: 20px;
                    }
                    .m-user-usn {
                        font-size: 24px;
                        font-weight: 800;
                        margin-bottom: 4px;
                        letter-spacing: -0.02em;
                    }
                    .m-ticket-id {
                        font-family: monospace;
                        color: #666;
                        font-size: 14px;
                    }
                    .m-ticket-footer {
                        background: rgba(34, 197, 94, 0.1);
                        color: #22c55e;
                        padding: 12px;
                        border-radius: 8px;
                        font-size: 12px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }
                }
            `}</style>
            </div>
        </div>
    );
};

export default ActivityDetails;
