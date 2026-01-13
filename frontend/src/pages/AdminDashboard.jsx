import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Calendar, Layout, Copy, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('rooms');
    const [rooms, setRooms] = useState([]);
    const [events, setEvents] = useState([]);

    // Form states
    const [roomForm, setRoomForm] = useState({ title: '', description: '', timer_minutes: 30 });
    const [eventForm, setEventForm] = useState({ title: '', description: '', category: 'Workshop', event_date: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const [roomsRes, eventsRes] = await Promise.all([
            axios.get('http://localhost:8080/api/rooms', { headers: { Authorization: token } }),
            axios.get('http://localhost:8080/api/events')
        ]);
        setRooms(roomsRes.data || []);
        setEvents(eventsRes.data || []);
    };

    const createRoom = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:8080/api/rooms', { ...roomForm, admin_id: user.id }, { headers: { Authorization: token } });
        setRoomForm({ title: '', description: '', timer_minutes: 30 });
        fetchData();
    };

    const closeRoom = async (roomId) => {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:8080/api/rooms/close', { room_id: roomId }, { headers: { Authorization: token } });
        fetchData();
    };

    const createEvent = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:8080/api/events',
            { ...eventForm, event_date: new Date(eventForm.event_date).toISOString() },
            { headers: { Authorization: token } }
        );
        setEventForm({ title: '', description: '', category: 'Workshop', event_date: '' });
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
                    REF. 000 // ADMIN_CONTROLS
                </div>
                <h1 className="caps" style={{ fontSize: '3rem', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    "MASTER CONTROL"
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <div className="tag-zip" style={{ background: 'var(--safety-yellow)' }}>SYSTEM_ROOT</div>
                    <div className="monospaced" style={{ fontSize: '10px', opacity: 0.5 }}>AUTH_LEVEL: 00</div>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '2px', marginBottom: '48px', border: '1px solid var(--border)', padding: '2px', background: 'var(--border)' }}>
                <button
                    onClick={() => setActiveTab('rooms')}
                    className={`caps ${activeTab === 'rooms' ? '' : 'opacity-60'}`}
                    style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'rooms' ? 'var(--white)' : 'var(--black)', color: activeTab === 'rooms' ? 'var(--black)' : 'var(--white)', cursor: 'pointer', fontWeight: '900', fontSize: '12px' }}
                >
                    "ROOMS_MANAGEMENT"
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`caps ${activeTab === 'events' ? '' : 'opacity-60'}`}
                    style={{ flex: 1, padding: '16px', border: 'none', background: activeTab === 'events' ? 'var(--white)' : 'var(--black)', color: activeTab === 'events' ? 'var(--black)' : 'var(--white)', cursor: 'pointer', fontWeight: '900', fontSize: '12px' }}
                >
                    "POST_EVENTS"
                </button>
            </div>

            {activeTab === 'rooms' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '48px' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card-industrial">
                        <div className="card-metadata">SRC: FORM_01</div>
                        <h3 className="caps" style={{ marginBottom: '32px', fontSize: '1.2rem' }}>"INITIALIZE_ROOM"</h3>
                        <form onSubmit={createRoom} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="input-wrapper">
                                <label className="input-label">"TITLE"</label>
                                <input
                                    className="input-industrial"
                                    placeholder="ENTRY_NAME"
                                    value={roomForm.title}
                                    onChange={e => setRoomForm({ ...roomForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"DESCRIPTION"</label>
                                <textarea
                                    className="input-industrial"
                                    placeholder="CONTEXT_METADATA"
                                    style={{ height: '100px', resize: 'none' }}
                                    value={roomForm.description}
                                    onChange={e => setRoomForm({ ...roomForm, description: e.target.value })}
                                />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"DURATION_PARAM"</label>
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
                                "CREATE_NODE"
                            </button>
                        </form>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-industrial">
                        <div className="card-metadata">SRC: DB_NODES</div>
                        <h3 className="caps" style={{ marginBottom: '32px', fontSize: '1.2rem' }}>"ACTIVE_NODES"</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
                            {rooms.map(room => (
                                <div key={room.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: 'var(--black)' }}>
                                    <div>
                                        <div className="caps" style={{ fontWeight: '800', fontSize: '14px' }}>{room.title}</div>
                                        <div className="monospaced" style={{ fontSize: '9px', opacity: 0.5 }}>UID: {room.id.substring(0, 12)}...</div>
                                        <div className="tag-zip" style={{ marginTop: '8px', background: 'var(--blueprint-blue)', color: 'white' }}>TTL: {room.timer_minutes}MIN</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button
                                            onClick={() => copyInviteLink(room.id)}
                                            className="btn-industrial"
                                            style={{ padding: '6px 12px', fontSize: '9px' }}
                                            data-ref="LINK"
                                        >
                                            <Copy size={12} />
                                        </button>
                                        <button
                                            onClick={() => closeRoom(room.id)}
                                            className="btn-industrial hover-glitch"
                                            style={{ padding: '6px 12px', fontSize: '9px', borderColor: 'var(--safety-orange)', color: 'var(--safety-orange)' }}
                                            data-ref="KILL"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '48px' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card-industrial">
                        <div className="card-metadata">SRC: EVENT_X</div>
                        <h3 className="caps" style={{ marginBottom: '32px', fontSize: '1.2rem' }}>"LOG_EVENT"</h3>
                        <form onSubmit={createEvent} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="input-wrapper">
                                <label className="input-label">"EVENT_TITLE"</label>
                                <input
                                    className="input-industrial"
                                    placeholder="INTEL_NAME"
                                    value={eventForm.title}
                                    onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"CATEGORY"</label>
                                <input
                                    className="input-industrial"
                                    placeholder="TAG"
                                    value={eventForm.category}
                                    onChange={e => setEventForm({ ...eventForm, category: e.target.value })}
                                />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"DATE_STAMP"</label>
                                <input
                                    type="datetime-local"
                                    className="input-industrial"
                                    value={eventForm.event_date}
                                    onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">"DESCRIPTION"</label>
                                <textarea
                                    className="input-industrial"
                                    placeholder="EXTENDED_INFO"
                                    style={{ height: '80px', resize: 'none' }}
                                    value={eventForm.description}
                                    onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn-industrial hover-glitch" style={{ background: 'var(--white)', color: 'var(--black)', justifyContent: 'center' }}>
                                "EXECUTE_POST"
                            </button>
                        </form>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-industrial">
                        <div className="card-metadata">SRC: DB_EVENTS</div>
                        <h3 className="caps" style={{ marginBottom: '32px', fontSize: '1.2rem' }}>"REGISTRY"</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
                            {events.map(event => (
                                <div key={event.id} style={{ padding: '20px', background: 'var(--black)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div className="caps" style={{ fontWeight: '800', fontSize: '14px' }}>{event.title}</div>
                                        <div className="monospaced" style={{ fontSize: '9px', opacity: 0.5 }}>{new Date(event.event_date).toLocaleString()}</div>
                                    </div>
                                    <div className="tag-zip">{event.category}</div>
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

