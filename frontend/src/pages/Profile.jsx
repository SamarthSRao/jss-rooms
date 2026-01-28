import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Hash, Shield, Edit2, Save, X, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const Profile = ({ user, setUser }) => {
    const [profile, setProfile] = useState(null);
    const [groups, setGroups] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
        fetchGroups();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/profile`, {
                headers: { Authorization: token }
            });
            setProfile(response.data);
            setEditedProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/groups`, {
                headers: { Authorization: token }
            });
            setGroups(response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/profile`, editedProfile, {
                headers: { Authorization: token }
            });
            setProfile(editedProfile);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'SYSTEM_STATUS // PROFILE_UPDATED' });

            // Update local storage user if needed
            const updatedUser = { ...user, ...editedProfile };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'SYSTEM_ERROR // UPDATE_FAILED' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
        setMessage({ type: '', text: '' });
    };

    if (loading) return (
        <div style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
            <div style={{ animation: 'pulse 1s infinite' }}>L0ADING_PROFILE...</div>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
    );

    return (
        <div style={{
            background: '#000',
            color: '#fff',
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
            padding: '60px 20px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <div style={{
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        opacity: 0.5,
                        marginBottom: '8px'
                    }}>
                        REF. 404 // PROFILE
                    </div>
                    <h1 style={{
                        textTransform: 'uppercase',
                        fontSize: '4.5rem',
                        letterSpacing: '-0.06em',
                        lineHeight: 0.9,
                        margin: 0,
                        fontWeight: '900'
                    }}>
                        "IDENTITY"
                    </h1>
                    <div style={{
                        height: '2px',
                        width: '200px',
                        margin: '20px auto 0',
                        background: '#fff',
                        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 5px, #000 5px, #000 10px)'
                    }}></div>
                </header>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ maxWidth: '600px', width: '100%' }}>
                        <div style={{
                            border: '1px solid rgba(255,255,255,0.2)',
                            padding: '40px',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                fontFamily: 'monospace',
                                fontSize: '9px',
                                opacity: 0.3,
                                letterSpacing: '0.1em'
                            }}>
                                ID: ACCOUNT
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{ position: 'relative', marginBottom: '32px' }}>
                                    <div style={{
                                        width: '192px',
                                        height: '192px',
                                        border: '2px solid #fff',
                                        background: '#18181b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {profile?.profile_image ? (
                                            <img src={profile.profile_image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={80} style={{ color: '#3f3f46' }} />
                                        )}
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-16px',
                                        right: '-16px',
                                        background: '#facc15',
                                        color: '#000',
                                        padding: '4px 12px',
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        letterSpacing: '0.15em'
                                    }}>
                                        VERIFIED
                                    </div>
                                </div>

                                <h2 style={{
                                    textTransform: 'uppercase',
                                    fontSize: '2.5rem',
                                    marginBottom: '8px',
                                    letterSpacing: '-0.02em',
                                    fontWeight: '900',
                                    margin: '0 0 8px 0',
                                    width: '100%'
                                }}>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.name || ''}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                            style={{
                                                background: '#000',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: '#fff',
                                                padding: '12px 16px',
                                                fontSize: '2rem',
                                                textTransform: 'uppercase',
                                                textAlign: 'center',
                                                width: '100%',
                                                fontWeight: '900',
                                                letterSpacing: '-0.02em'
                                            }}
                                            placeholder="FULL_NAME"
                                        />
                                    ) : (
                                        profile?.name || 'ANONYMOUS'
                                    )}
                                </h2>
                                <div style={{
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    opacity: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '32px'
                                }}>
                                    <Hash size={12} /> {profile?.usn || 'JSS-NO-ID'}
                                </div>

                                {message.text && (
                                    <div style={{
                                        fontFamily: 'monospace',
                                        fontSize: '10px',
                                        width: '100%',
                                        marginBottom: '32px',
                                        padding: '16px',
                                        border: '1px solid #fff',
                                        background: message.type === 'success' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'
                                    }}>
                                        {message.text}
                                    </div>
                                )}

                                <div style={{ width: '100%', textAlign: 'left' }}>
                                    <div style={{ marginBottom: '32px' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            marginBottom: '12px',
                                            opacity: 0.6
                                        }}>"BIO"</label>
                                        {isEditing ? (
                                            <textarea
                                                value={editedProfile.bio || ''}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                                style={{
                                                    background: '#000',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    color: '#fff',
                                                    padding: '12px 16px',
                                                    width: '100%',
                                                    fontSize: '14px',
                                                    resize: 'none',
                                                    lineHeight: 1.6
                                                }}
                                                rows="3"
                                                placeholder="Tell us about yourself..."
                                            />
                                        ) : (
                                            <p style={{ opacity: 0.7, lineHeight: 1.6, margin: 0 }}>
                                                {profile?.bio || '-- No biography available --'}
                                            </p>
                                        )}
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '32px',
                                        marginBottom: '32px'
                                    }}>
                                        <div>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                letterSpacing: '0.1em',
                                                textTransform: 'uppercase',
                                                marginBottom: '12px',
                                                opacity: 0.6
                                            }}>"ROLE"</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Shield size={20} style={{ color: '#71717a' }} />
                                                <span style={{ textTransform: 'uppercase', fontWeight: '900' }}>
                                                    {profile?.role?.toUpperCase() || 'STUDENT'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                letterSpacing: '0.1em',
                                                textTransform: 'uppercase',
                                                marginBottom: '12px',
                                                opacity: 0.6
                                            }}>"JOINED_GROUP"</label>
                                            {isEditing ? (
                                                <select
                                                    value={editedProfile.group_id || ''}
                                                    onChange={(e) => setEditedProfile({ ...editedProfile, group_id: e.target.value })}
                                                    style={{
                                                        background: '#000',
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                        color: '#fff',
                                                        padding: '12px',
                                                        width: '100%',
                                                        fontSize: '14px',
                                                        textTransform: 'uppercase',
                                                        fontWeight: '700',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="">SELECT_GROUP</option>
                                                    {groups.map(g => (
                                                        <option key={g.id} value={g.id}>{g.name.toUpperCase()}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <Users size={20} style={{ color: '#71717a' }} />
                                                    <span style={{ textTransform: 'uppercase', fontWeight: '900' }}>
                                                        {groups.find(g => g.id === profile?.group_id)?.name || 'NONE'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* REGISTERED ACTIVITIES SECTION */}
                                    {profile?.activity_registrations && profile.activity_registrations.length > 0 && (
                                        <div style={{
                                            paddingTop: '32px',
                                            borderTop: '1px dashed #27272a',
                                            marginTop: '32px'
                                        }}>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                letterSpacing: '0.1em',
                                                textTransform: 'uppercase',
                                                marginBottom: '16px',
                                                opacity: 0.6
                                            }}>
                                                <Activity size={14} /> "REGISTERED_ACTIVITIES"
                                            </label>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                {profile.activity_registrations.map(reg => (
                                                    <div key={reg.id} style={{
                                                        background: '#18181b',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        padding: '16px',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <div>
                                                            <h4 style={{
                                                                textTransform: 'uppercase',
                                                                fontWeight: '700',
                                                                margin: '0 0 4px 0'
                                                            }}>
                                                                {reg.activity?.title || 'Unknown Activity'}
                                                            </h4>
                                                            <div style={{
                                                                fontFamily: 'monospace',
                                                                fontSize: '10px',
                                                                opacity: 0.5,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px'
                                                            }}>
                                                                <span>REF: {reg.activity_id.substring(0, 16)}</span>
                                                                <span>//</span>
                                                                <span style={{
                                                                    color: reg.status === 'registered' ? '#22c55e' : '#71717a'
                                                                }}>
                                                                    {reg.status.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: '40px', width: '100%' }}>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: '#fff',
                                                padding: '16px',
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '12px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}
                                        >
                                            "EDIT_PROFILE" <Edit2 size={14} />
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <button
                                                onClick={handleUpdate}
                                                style={{
                                                    background: '#fff',
                                                    border: '1px solid #fff',
                                                    color: '#000',
                                                    padding: '16px',
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '12px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '900',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}
                                            >
                                                "SAVE" <Save size={14} />
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid #f97316',
                                                    color: '#f97316',
                                                    padding: '16px',
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '12px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}
                                            >
                                                "CANCEL" <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer style={{
                    marginTop: '100px',
                    padding: '40px 0',
                    borderTop: '1px dotted rgba(255,255,255,0.2)',
                    fontFamily: 'monospace',
                    opacity: 0.2,
                    fontSize: '10px',
                    textAlign: 'center'
                }}>
                    USER_ID: {user?.id?.toUpperCase() || 'UNKNOWN'} // SINCE_2026
                </footer>
            </div>
        </div>
    );
};

export default Profile;
