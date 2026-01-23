import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Calendar, Layout, Copy, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('rooms');
    const [rooms, setRooms] = useState([]);
    const [events, setEvents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [activities, setActivities] = useState([]);
    const [registrations, setRegistrations] = useState({});

    // Form states
    const [roomForm, setRoomForm] = useState({ title: '', description: '', timer_minutes: 30 });
    const [eventForm, setEventForm] = useState({ title: '', description: '', category: 'Workshop', event_date: '', location: '', capacity: 0 });
    const [groupForm, setGroupForm] = useState({ name: '', description: '' });
    const [activityForm, setActivityForm] = useState({ title: '', description: '', location: '', start_time: '', image_url: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const [roomsRes, eventsRes, groupsRes, activitiesRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/rooms`, { headers: { Authorization: token } }),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/events`),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/groups`, { headers: { Authorization: token } }),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/activities`)
        ]);
        setRooms(roomsRes.data || []);
        setEvents(eventsRes.data || []);
        setGroups(groupsRes.data || []);
        setActivities(activitiesRes.data || []);

        // Fetch registrations for each event
        const regs = {};
        for (const event of eventsRes.data || []) {
            try {
                const regRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/events/registrations?event_id=${event.id}`, { headers: { Authorization: token } });
                regs[event.id] = regRes.data || [];
            } catch (err) {
                console.error(`Error fetching registrations for event ${event.id}`, err);
            }
        }
        setRegistrations(regs);
    };

    const createRoom = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/rooms`, { ...roomForm, admin_id: user.id }, { headers: { Authorization: token } });
        setRoomForm({ title: '', description: '', timer_minutes: 30 });
        fetchData();
    };

    const createGroup = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/groups`, groupForm, { headers: { Authorization: token } });
        setGroupForm({ name: '', description: '' });
        fetchData();
    };

    const createActivity = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const payload = {
            ...activityForm,
            start_time: new Date(activityForm.start_time).toISOString(),
            end_time: new Date(activityForm.start_time).toISOString()
        };
        // Remove event_id if it's an empty string to avoid UUID parsing errors on backend
        if (!payload.event_id) {
            delete payload.event_id;
        }

        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/activities`,
            payload,
            { headers: { Authorization: token } }
        );
        setActivityForm({ title: '', description: '', location: '', start_time: '', image_url: '' });
        fetchData();
    };

    const closeRoom = async (roomId) => {
        const token = localStorage.getItem('token');
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/rooms/close`, { room_id: roomId }, { headers: { Authorization: token } });
        fetchData();
    };

    const createEvent = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/events`,
            { ...eventForm, event_date: new Date(eventForm.event_date).toISOString(), organizer_id: user.id },
            { headers: { Authorization: token } }
        );
        setEventForm({ title: '', description: '', category: 'Workshop', event_date: '', location: '', capacity: 0 });
        fetchData();
    };

    const copyInviteLink = (roomId) => {
        const link = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard.writeText(link);
        alert('Invite link copied to clipboard!');
    };

    return (
        <div className="container fade-in">
            <header style={{ marginBottom: '60px' }}>
                <div className="monospaced caps" style={{ fontSize: '10px', opacity: 0.5, marginBottom: '8px' }}>
                    REF. 000 // ADMIN_DASHBOARD
                </div>
                <h1 className="caps" style={{ fontSize: '3rem', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    "MASTER CONTROL"
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <div className="tag-zip" style={{ background: 'var(--safety-yellow)' }}>SYSTEM_ROOT</div>
                    <div className="monospaced" style={{ fontSize: '10px', opacity: 0.5 }}>STATUS: ACTIVE</div>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '2px', marginBottom: '48px', border: '1px solid var(--border)', padding: '2px', background: 'var(--border)' }}>
                <button
                    onClick={() => setActiveTab('rooms')}
                    className={`caps ${activeTab === 'rooms' ? '' : 'opacity-60'}`}
                    style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'rooms' ? 'var(--white)' : 'var(--black)', color: activeTab === 'rooms' ? 'var(--black)' : 'var(--white)', cursor: 'pointer', fontWeight: '900', fontSize: '12px' }}
                >
                    "ROOMS"
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`caps ${activeTab === 'events' ? '' : 'opacity-60'}`}
                    style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'events' ? 'var(--white)' : 'var(--black)', color: activeTab === 'events' ? 'var(--black)' : 'var(--white)', cursor: 'pointer', fontWeight: '900', fontSize: '12px' }}
                >
                    "EVENTS"
                </button>
                <button
                    onClick={() => setActiveTab('activities')}
                    className={`caps ${activeTab === 'activities' ? '' : 'opacity-60'}`}
                    style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'activities' ? 'var(--white)' : 'var(--black)', color: activeTab === 'activities' ? 'var(--black)' : 'var(--white)', cursor: 'pointer', fontWeight: '900', fontSize: '12px' }}
                >
                    "ACTIVITIES"
                </button>
                <button
                    onClick={() => setActiveTab('groups')}
                    className={`caps ${activeTab === 'groups' ? '' : 'opacity-60'}`}
                    style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'groups' ? 'var(--white)' : 'var(--black)', color: activeTab === 'groups' ? 'var(--black)' : 'var(--white)', cursor: 'pointer', fontWeight: '900', fontSize: '12px' }}
                >
                    "GROUPS"
                </button>
            </div>

            {activeTab === 'rooms' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card-industrial">
                        <div className="card-metadata">SRC: FORM</div>
                        <h3 className="caps" style={{ marginBottom: '32px', fontSize: '1.2rem' }}>"CREATE_ROOM"</h3>
                        <form onSubmit={createRoom} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="input-wrapper">
                                <label className="input-label">"TITLE"</label>
                                <input
                                    className="input-industrial"
                                    placeholder="ROOM_NAME"
                                    value={roomForm.title}
                                    onChange={e => setRoomForm({ ...roomForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"DESCRIPTION"</label>
                                <textarea
                                    className="input-industrial"
                                    placeholder="Tell us about this room..."
                                    style={{ height: '100px', resize: 'none' }}
                                    value={roomForm.description}
                                    onChange={e => setRoomForm({ ...roomForm, description: e.target.value })}
                                />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"TIMER_LIMIT"</label>
                                <select
                                    className="input-industrial"
                                    value={roomForm.timer_minutes}
                                    onChange={e => setRoomForm({ ...roomForm, timer_minutes: parseInt(e.target.value) })}
                                    required
                                    style={{ appearance: 'none' }}
                                >
                                    <option value={5}>05_MIN</option>
                                    <option value={10}>10_MIN</option>
                                    <option value={30}>30_MIN</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-industrial hover-glitch" style={{ background: 'var(--white)', color: 'var(--black)', justifyContent: 'center' }}>
                                "CREATE"
                            </button>
                        </form>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-industrial">
                        <div className="card-metadata">SRC: DATABASE</div>
                        <h3 className="caps" style={{ marginBottom: '32px', fontSize: '1.2rem' }}>"ACTIVE_ROOMS"</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
                            {rooms.map(room => (
                                <div key={room.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: 'var(--black)' }}>
                                    <div>
                                        <div className="caps" style={{ fontWeight: '800', fontSize: '14px' }}>{room.title}</div>
                                        <div className="monospaced" style={{ fontSize: '9px', opacity: 0.5 }}>ID: {room.id}</div>
                                        <div className="tag-zip" style={{ marginTop: '8px', background: 'var(--blueprint-blue)', color: 'white' }}>LIMIT: {room.timer_minutes}M</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button onClick={() => copyInviteLink(room.id)} className="btn-industrial" style={{ padding: '6px 12px', fontSize: '9px' }}>
                                            <Copy size={12} />
                                        </button>
                                        <button onClick={() => closeRoom(room.id)} className="btn-industrial hover-glitch" style={{ padding: '6px 12px', fontSize: '9px', borderColor: 'var(--safety-orange)', color: 'var(--safety-orange)' }}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {activeTab === 'events' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card-industrial">
                        <div className="card-metadata">SRC: NEW_ENTRY</div>
                        <h3 className="caps" style={{ marginBottom: '32px', fontSize: '1.2rem' }}>"POST_EVENT"</h3>
                        <form onSubmit={createEvent} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="input-wrapper">
                                    <label className="input-label">"TITLE"</label>
                                    <input className="input-industrial" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} required />
                                </div>
                                <div className="input-wrapper">
                                    <label className="input-label">"CATEGORY"</label>
                                    <input className="input-industrial" value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="input-wrapper">
                                    <label className="input-label">"LOCATION"</label>
                                    <input className="input-industrial" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} />
                                </div>
                                <div className="input-wrapper">
                                    <label className="input-label">"CAPACITY"</label>
                                    <input type="number" className="input-industrial" value={eventForm.capacity} onChange={e => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"DATE & TIME"</label>
                                <input type="datetime-local" className="input-industrial" value={eventForm.event_date} onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })} required />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"DESCRIPTION"</label>
                                <textarea className="input-industrial" style={{ height: '80px', resize: 'none' }} value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
                            </div>
                            <button type="submit" className="btn-industrial hover-glitch" style={{ background: 'var(--white)', color: 'var(--black)', justifyContent: 'center' }}>"POST_EVENT"</button>
                        </form>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-industrial">
                        <div className="card-metadata">SRC: DATABASE</div>
                        <h3 className="caps" style={{ marginBottom: '32px', fontSize: '1.2rem' }}>"ACTIVE_EVENTS"</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
                            {events.map(event => (
                                <div key={event.id} style={{ padding: '20px', background: 'var(--black)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div className="caps" style={{ fontWeight: '800', fontSize: '14px' }}>{event.title}</div>
                                        <div className="monospaced" style={{ fontSize: '9px', opacity: 0.5 }}>REGS: {registrations[event.id]?.length || 0} / {event.capacity || '∞'}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="tag-zip">{event.category}</div>
                                        <button onClick={() => window.location.href = '/admin/checkin'} className="btn-industrial" style={{ padding: '4px 8px', fontSize: '8px' }}>"SCAN"</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {activeTab === 'activities' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card-industrial">
                        <div className="card-metadata">SRC: NEW_ENTRY</div>
                        <h3 className="caps" style={{ marginBottom: '32px', fontSize: '1.2rem' }}>"POST_ACTIVITY"</h3>
                        <form onSubmit={createActivity} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="input-wrapper">
                                <label className="input-label">"PARENT_EVENT"</label>
                                <select
                                    className="input-industrial"
                                    value={activityForm.event_id || ''}
                                    onChange={e => setActivityForm({ ...activityForm, event_id: e.target.value })}
                                    style={{ appearance: 'none' }}
                                >
                                    <option value="">-- SELECT EVENT --</option>
                                    {events.map(ev => (
                                        <option key={ev.id} value={ev.id}>{ev.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"TITLE"</label>
                                <input className="input-industrial" value={activityForm.title} onChange={e => setActivityForm({ ...activityForm, title: e.target.value })} required />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"LOCATION"</label>
                                <input className="input-industrial" value={activityForm.location} onChange={e => setActivityForm({ ...activityForm, location: e.target.value })} />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"DATE & TIME"</label>
                                <input type="datetime-local" className="input-industrial" value={activityForm.start_time} onChange={e => setActivityForm({ ...activityForm, start_time: e.target.value })} required />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"IMAGE_URL"</label>
                                <input className="input-industrial" value={activityForm.image_url} onChange={e => setActivityForm({ ...activityForm, image_url: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"DESCRIPTION"</label>
                                <textarea className="input-industrial" style={{ height: '80px', resize: 'none' }} value={activityForm.description} onChange={e => setActivityForm({ ...activityForm, description: e.target.value })} />
                            </div>
                            <button type="submit" className="btn-industrial hover-glitch" style={{ background: 'var(--white)', color: 'var(--black)', justifyContent: 'center' }}>"POST_ACTIVITY"</button>
                        </form>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-industrial">
                        <div className="card-metadata">SRC: DATABASE</div>
                        <h3 className="caps" style={{ marginBottom: '32px', fontSize: '1.2rem' }}>"ACTIVE_ACTIVITIES"</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
                            {activities.map(activity => (
                                <div key={activity.id} style={{ padding: '20px', background: 'var(--black)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div className="caps" style={{ fontWeight: '800', fontSize: '14px' }}>{activity.title}</div>
                                        <div className="monospaced" style={{ fontSize: '9px', opacity: 0.5 }}>{new Date(activity.start_time).toLocaleString()}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="tag-zip">ACTIVITY</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {activeTab === 'groups' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card-industrial">
                        <div className="card-metadata">SRC: NEW_ENTRY</div>
                        <h3 className="caps" style={{ marginBottom: '32px', fontSize: '1.2rem' }}>"CREATE_GROUP"</h3>
                        <form onSubmit={createGroup} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="input-wrapper">
                                <label className="input-label">"GROUP_NAME"</label>
                                <input className="input-industrial" value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} required />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"DESCRIPTION"</label>
                                <textarea className="input-industrial" style={{ height: '80px', resize: 'none' }} value={groupForm.description} onChange={e => setGroupForm({ ...groupForm, description: e.target.value })} />
                            </div>
                            <button type="submit" className="btn-industrial hover-glitch" style={{ background: 'var(--white)', color: 'var(--black)', justifyContent: 'center' }}>"CREATE"</button>
                        </form>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-industrial">
                        <div className="card-metadata">SRC: DATABASE</div>
                        <h3 className="caps" style={{ marginBottom: '32px', fontSize: '1.2rem' }}>"ACTIVE_GROUPS"</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
                            {groups.map(group => (
                                <div key={group.id} style={{ padding: '20px', background: 'var(--black)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div className="caps" style={{ fontWeight: '800', fontSize: '14px' }}>{group.name}</div>
                                        <div className="monospaced" style={{ fontSize: '9px', opacity: 0.5 }}>{group.description}</div>
                                    </div>
                                    <div className="tag-zip" style={{ background: 'var(--blueprint-blue)' }}>ACTIVE</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="cross-hatch" style={{ height: '20px', width: '100%', marginTop: '60px', opacity: 0.1 }}></div>
        </div>
    );
};

export default AdminDashboard;
