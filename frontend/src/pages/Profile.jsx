import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Hash, Shield, Edit2, Save, X, Users, MapPin, Activity } from 'lucide-react';
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
        } catch (error) {
            setMessage({ type: 'error', text: 'SYSTEM_ERROR // UPDATE_FAILED' });
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-black">
            <div className="monospaced caps animate-pulse">L0ADING_PROFILE...</div>
        </div>
    );

    return (
        <div className="container fade-in">
            <header style={{ marginBottom: '60px', textAlign: 'center' }}>
                <div className="monospaced caps" style={{ fontSize: '10px', opacity: 0.5, marginBottom: '8px' }}>
                    REF. 404 // PROFILE
                </div>
                <h1 className="caps" style={{ fontSize: '4.5rem', letterSpacing: '-0.06em', lineHeight: 0.9 }}>
                    "IDENTITY"
                </h1>
                <div className="cross-hatch" style={{ height: '2px', width: '200px', margin: '20px auto 0', background: 'var(--white)' }}></div>
            </header>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ maxWidth: '600px', width: '100%' }}
                >
                    <div className="card-industrial" style={{ padding: '40px' }}>
                        <div className="card-metadata">ID: ACCOUNT</div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div className="relative inline-block mb-8">
                                <div className="w-48 h-48 rounded-none border-2 border-white overflow-hidden bg-zinc-900 flex items-center justify-center">
                                    {profile?.profile_image ? (
                                        <img src={profile.profile_image} alt="Profile" className="w-full h-full object-cover opacity-80" />
                                    ) : (
                                        <User size={80} className="text-zinc-700" />
                                    )}
                                </div>
                                <div className="absolute -bottom-4 -right-4">
                                    <span className="tag-zip">VERIFIED</span>
                                </div>
                            </div>

                            <h2 className="caps" style={{ fontSize: '2.5rem', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedProfile.name || ''}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                        className="input-industrial text-center"
                                        placeholder="FULL_NAME"
                                    />
                                ) : (
                                    profile?.name || 'ANONYMOUS'
                                )}
                            </h2>
                            <div className="monospaced text-xs opacity-50 flex items-center justify-center gap-2 mb-8">
                                <Hash size={12} /> {profile?.usn}
                            </div>

                            {message.text && (
                                <div className="monospaced text-[10px] w-full mb-8 p-4 border border-white" style={{ background: message.type === 'success' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)' }}>
                                    {message.text}
                                </div>
                            )}

                            <div className="w-full space-y-8 text-left">
                                <div className="input-wrapper">
                                    <label className="input-label">"BIO"</label>
                                    {isEditing ? (
                                        <textarea
                                            value={editedProfile.bio || ''}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                            className="input-industrial"
                                            rows="3"
                                            placeholder="Tell us about yourself..."
                                            style={{ resize: 'none' }}
                                        />
                                    ) : (
                                        <p className="opacity-70 leading-relaxed font-medium">
                                            {profile?.bio || '-- No biography available --'}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="border border-zinc-800 p-4 bg-black/20 text-center relative group hover:border-white/40 transition-colors">
                                        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-zinc-800 group-hover:bg-safety-orange transition-colors"></div>
                                        <div className="monospaced text-[10px] opacity-50 mb-1">EVENTS_REGISTERED</div>
                                        <div className="text-4xl font-black leading-none">{profile?.activity_registrations?.length || 0}</div>
                                    </div>
                                    <div className="border border-zinc-800 p-4 bg-black/20 text-center relative group hover:border-white/40 transition-colors">
                                        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-zinc-800 group-hover:bg-safety-orange transition-colors"></div>
                                        <div className="monospaced text-[10px] opacity-50 mb-1">GROUPS_JOINED</div>
                                        <div className="text-4xl font-black leading-none">{profile?.group_id ? 1 : 0}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="input-label">"ROLE"</label>
                                        <div className="flex items-center gap-3">
                                            <Shield size={20} className="text-zinc-500" />
                                            <span className="caps font-black">{profile?.role?.toUpperCase()}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="input-label">"GROUP"</label>
                                        {isEditing ? (
                                            <select
                                                value={editedProfile.group_id || ''}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, group_id: e.target.value })}
                                                className="input-industrial"
                                                style={{ appearance: 'none', background: 'var(--black)', padding: '12px' }}
                                            >
                                                <option value="">SELECT_GROUP</option>
                                                {groups.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Users size={20} className="text-zinc-500" />
                                                <span className="caps font-black">{groups.find(g => g.id === profile?.group_id)?.name || 'NONE'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* REGISTERED ACTIVITIES SECTION */}
                                {profile?.activity_registrations && profile.activity_registrations.length > 0 && (
                                    <div className="pt-8 border-t border-dashed border-zinc-800">
                                        <div className="flex items-center justify-between mb-6">
                                            <label className="input-label flex items-center gap-2 mb-0">
                                                <Activity size={14} /> "REGISTERED_ACTIVITIES"
                                            </label>
                                            <div className="monospaced text-[10px] opacity-40">
                                                TOTAL: {profile.activity_registrations.length}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {profile.activity_registrations.map(reg => (
                                                <div key={reg.id} className="group bg-zinc-900/30 border border-white/5 p-4 hover:border-white/30 hover:bg-zinc-900 transition-all duration-300 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-transparent border-r-white/5 group-hover:border-r-safety-orange transition-colors"></div>

                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <h4 className="caps font-bold text-lg leading-tight mb-1 group-hover:text-white transition-colors text-white/90">
                                                                {reg.activity?.title || 'Unknown Activity'}
                                                            </h4>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <div className="monospaced text-[9px] opacity-40 px-1 border border-white/20">
                                                                    ID: {reg.activity_id.substring(0, 6)}
                                                                </div>
                                                                {reg.activity?.location && (
                                                                    <div className="monospaced text-[9px] opacity-60 flex items-center gap-1">
                                                                        <MapPin size={8} /> {reg.activity.location}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className={`monospaced text-[9px] font-bold px-2 py-1 border ${reg.status === 'registered'
                                                                ? 'border-green-900/50 bg-green-900/10 text-green-500'
                                                                : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                                                            }`}>
                                                            {reg.status?.toUpperCase()}
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
                                    <button onClick={() => setIsEditing(true)} className="btn-industrial w-full justify-center" data-ref="EDIT">
                                        "EDIT_PROFILE" <Edit2 size={14} />
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <button onClick={handleUpdate} className="btn-industrial w-full justify-center" style={{ background: 'var(--white)', color: 'black' }} data-ref="SAVE">
                                            "SAVE" <Save size={14} />
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className="btn-industrial w-full justify-center" style={{ borderColor: 'var(--safety-orange)', color: 'var(--safety-orange)' }} data-ref="CANCEL">
                                            "CANCEL" <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <footer style={{ marginTop: '100px', padding: '40px 0', borderTop: '1px dotted var(--border)' }} className="monospaced opacity-20 text-[10px] text-center">
                USER_ID: {user.id.toUpperCase()} // SINCE_2026
            </footer>
        </div>
    );
};

export default Profile;
