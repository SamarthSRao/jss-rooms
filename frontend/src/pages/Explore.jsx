import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Clock, Calendar, ArrowRight } from 'lucide-react';

const Explore = ({ user }) => {
    const [rooms, setRooms] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [roomsRes, eventsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/rooms`, { headers: { Authorization: token } }),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/events`)
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
        <div className="container fade-in">
            <header style={{ marginBottom: '80px', position: 'relative' }}>
                <div className="monospaced caps" style={{ fontSize: '10px', opacity: 0.5, marginBottom: '8px' }}>
                    REF. 088 // DISCOVER_MODULE
                </div>
                <h1 className="caps" style={{ fontSize: '4rem', letterSpacing: '-0.06em', marginBottom: '4px', lineHeight: 0.9 }}>
                    "EXPLORE"
                </h1>
                <div className="monospaced caps" style={{ fontSize: '12px', opacity: 0.7 }}>
                    Collection of active nodes and institutional events. ©2026
                </div>
                <div className="cross-hatch" style={{ height: '2px', width: '200px', marginTop: '20px', background: 'var(--safety-orange)' }}></div>
            </header>

            <section style={{ marginBottom: '100px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '40px' }}>
                    <h2 className="caps" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>"ACTIVE ROOMS"</h2>
                    <span className="monospaced" style={{ fontSize: '12px', opacity: 0.5 }}>COUNT: {rooms.length}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '40px' }}>
                    {rooms.map((room, idx) => (
                        <motion.div
                            key={room.id}
                            whileHover={{ scale: 1.02 }}
                            className="card-industrial"
                        >
                            <div className="card-metadata">ID: RM-{idx.toString().padStart(3, '0')}</div>
                            <div className="tag-zip" style={{ marginBottom: '16px' }}>LIVE</div>

                            <h3 className="caps" style={{ fontSize: '1.4rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                {room.title}
                            </h3>

                            <p className="opacity-60" style={{ fontSize: '13px', marginBottom: '32px', height: '40px', overflow: 'hidden', lineHeight: '1.6' }}>
                                {room.description}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div className="monospaced" style={{ fontSize: '10px' }}>
                                    <div style={{ opacity: 0.5 }}>TTL:</div>
                                    <div style={{ color: 'var(--safety-orange)', fontWeight: 'bold' }}>{room.timer_minutes} MINUTES</div>
                                </div>

                                <Link to={`/room/${room.id}`} className="btn-industrial" style={{ padding: '8px 16px', fontSize: '11px' }} data-ref="JOIN">
                                    "ENTER" <ArrowRight size={14} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                    {rooms.length === 0 && !loading && (
                        <div className="monospaced opacity-30 caps" style={{ border: '1px dashed var(--border)', padding: '40px', textAlign: 'center' }}>
                            -- NO ACTIVE NODES DETECTED --
                        </div>
                    )}
                </div>
            </section>

            <section>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '40px' }}>
                    <h2 className="caps" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>"EVENTS"</h2>
                    <span className="monospaced" style={{ fontSize: '12px', opacity: 0.5 }}>CAMPUS_INTEL</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '30px' }}>
                    {events.map((event, idx) => (
                        <div key={event.id} className="card-industrial" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ height: '200px', background: 'var(--industrial-gray)', position: 'relative', borderBottom: '1px solid var(--border)' }}>
                                {event.image_url ? (
                                    <img src={event.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                                ) : (
                                    <div className="cross-hatch" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="monospaced caps opacity-30">NO_IMG_ASSET</span>
                                    </div>
                                )}
                                <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                                    <span className="tag-zip">{event.category}</span>
                                </div>
                                <div className="monospaced" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '8px', background: 'black', padding: '2px 6px' }}>
                                    EVT. {idx + 100}
                                </div>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <h3 className="caps" style={{ marginBottom: '10px', fontSize: '1.2rem' }}>{event.title}</h3>
                                <p className="opacity-60" style={{ fontSize: '13px', marginBottom: '20px' }}>{event.description}</p>
                                <div className="monospaced" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
                                    <MapPin size={10} /> LOCK: JSS_STU_CAMPUS
                                </div>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && !loading && (
                        <div className="monospaced opacity-30 caps" style={{ padding: '20px' }}>
                            NULL_DATABASE_STATE
                        </div>
                    )}
                </div>
            </section>

            <footer style={{ marginTop: '120px', padding: '40px 0', borderTop: '1px solid var(--border)', opacity: 0.3 }} className="monospaced caps">
                <div style={{ fontSize: '10px' }}>PROTOTYPE VERSION 2.0.4 - FOR ACADEMIC USE ONLY</div>
                <div style={{ fontSize: '10px' }}>DEVELOPED BY JSS_DEV_CORE</div>
            </footer>
        </div>
    );
};

export default Explore;

