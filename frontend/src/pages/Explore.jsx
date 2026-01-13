import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Clock, Calendar } from 'lucide-react';

const Explore = ({ user }) => {
    const [rooms, setRooms] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [roomsRes, eventsRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/rooms', { headers: { Authorization: token } }),
                    axios.get('http://localhost:8080/api/events')
                ]);
                setRooms(roomsRes.data || []);
                setEvents(eventsRes.data || []);
            } catch (err) {
                console.error('Error fetching data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="container">
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Explore Space</h1>
                <p style={{ color: 'var(--text-muted)' }}>Discover active rooms and upcoming college events.</p>
            </header>

            <section style={{ marginBottom: '60px' }}>
                <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Users size={24} color="var(--primary)" /> Active Rooms
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {rooms.map((room) => (
                        <motion.div
                            key={room.id}
                            whileHover={{ y: -5 }}
                            className="glass-panel"
                            style={{ padding: '24px' }}
                        >
                            <h3 style={{ marginBottom: '8px' }}>{room.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', height: '40px', overflow: 'hidden' }}>
                                {room.description}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={14} /> Expires in {room.timer_minutes}m
                                </span>
                                <Link to={`/room/${room.id}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                                    Join Room
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                    {rooms.length === 0 && !loading && (
                        <p style={{ color: 'var(--text-muted)' }}>No active rooms at the moment.</p>
                    )}
                </div>
            </section>

            <section>
                <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Calendar size={24} color="var(--primary)" /> Upcoming Events
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                    {events.map((event) => (
                        <div key={event.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                            <div style={{ height: '180px', background: 'linear-gradient(45deg, #312e81, #1e1b4b)', position: 'relative' }}>
                                {event.image_url && <img src={event.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                    {event.category}
                                </div>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <h3 style={{ marginBottom: '8px' }}>{event.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>{event.description}</p>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MapPin size={14} /> JSS Science and Technology University
                                </div>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && !loading && (
                        <p style={{ color: 'var(--text-muted)' }}>No events posted yet.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Explore;
