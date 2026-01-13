import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Calendar, Layout } from 'lucide-react';

const AdminDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('rooms');
    const [rooms, setRooms] = useState([]);
    const [events, setEvents] = useState([]);

    // Form states
    const [roomForm, setRoomForm] = useState({ title: '', description: '', timer_hours: 24 });
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
        setRoomForm({ title: '', description: '', timer_hours: 24 });
        fetchData();
    };

    const closeRoom = async (roomId) => {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:8080/api/rooms/close', { room_id: roomId }, { headers: { Authorization: token } });
        fetchData();
    };

    const createEvent = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:8080/api/events', { ...eventForm, event_date: new Date(eventForm.event_date).toISOString() });
        setEventForm({ title: '', description: '', category: 'Workshop', event_date: '' });
        fetchData();
    };

    return (
        <div className="container">
            <h1 style={{ marginBottom: '32px' }}>Admin Controls</h1>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                <button
                    onClick={() => setActiveTab('rooms')}
                    className={activeTab === 'rooms' ? 'btn-primary' : 'glass-panel'}
                    style={{ padding: '8px 20px', border: activeTab === 'rooms' ? 'none' : '1px solid var(--border)' }}
                >
                    Rooms Management
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={activeTab === 'events' ? 'btn-primary' : 'glass-panel'}
                    style={{ padding: '8px 20px', border: activeTab === 'events' ? 'none' : '1px solid var(--border)' }}
                >
                    Post Events
                </button>
            </div>

            {activeTab === 'rooms' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                    <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '20px' }}>Create New Room</h3>
                        <form onSubmit={createRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input
                                className="input-field"
                                placeholder="Room Title"
                                value={roomForm.title}
                                onChange={e => setRoomForm({ ...roomForm, title: e.target.value })}
                                required
                            />
                            <textarea
                                className="input-field"
                                placeholder="Description"
                                style={{ height: '100px' }}
                                value={roomForm.description}
                                onChange={e => setRoomForm({ ...roomForm, description: e.target.value })}
                            />
                            <input
                                type="number"
                                className="input-field"
                                placeholder="Timer (Hours)"
                                value={roomForm.timer_hours}
                                onChange={e => setRoomForm({ ...roomForm, timer_hours: parseInt(e.target.value) })}
                                required
                            />
                            <button type="submit" className="btn-primary">Create Room</button>
                        </form>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Active Rooms</h3>
                        {rooms.map(room => (
                            <div key={room.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border)' }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{room.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Timer: {room.timer_hours}h</div>
                                </div>
                                <button onClick={() => closeRoom(room.id)} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                    <Trash2 size={18} /> Close
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                    <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '20px' }}>Post New Event</h3>
                        <form onSubmit={createEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input
                                className="input-field"
                                placeholder="Event Title"
                                value={eventForm.title}
                                onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                                required
                            />
                            <input
                                className="input-field"
                                placeholder="Category"
                                value={eventForm.category}
                                onChange={e => setEventForm({ ...eventForm, category: e.target.value })}
                            />
                            <input
                                type="datetime-local"
                                className="input-field"
                                value={eventForm.event_date}
                                onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })}
                                required
                            />
                            <textarea
                                className="input-field"
                                placeholder="Description"
                                style={{ height: '100px' }}
                                value={eventForm.description}
                                onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                            />
                            <button type="submit" className="btn-primary">Post Event</button>
                        </form>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Current Events</h3>
                        {events.map(event => (
                            <div key={event.id} style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ fontWeight: '600' }}>{event.title}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(event.event_date).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
