import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Clock, Calendar, ArrowRight, Zap, ExternalLink } from 'lucide-react';

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
                <div className="monospaced" style={{ fontSize: '10px', opacity: 0.3, letterSpacing: '0.2em', marginBottom: '12px' }}>
                    PLATFORM_ACCESS_04
                </div>
                <h1 className="caps" style={{ fontSize: '4rem', letterSpacing: '-0.07em', marginBottom: '8px', lineHeight: 0.85, fontWeight: '900' }}>
                    EXPLORE
                </h1>
                <div className="flex items-center gap-6 mt-6">
                    <span className="monospaced text-[11px] opacity-60">
                        ACTIVE_NODES & CAMPUS_EVENTS
                    </span>
                    <div style={{ height: '1px', width: '100px', background: 'var(--white)', opacity: 0.2 }}></div>
                    <span className="tag-zip" style={{ background: 'var(--white)', color: 'black', fontSize: '8px' }}>v4.5</span>
                </div>
            </header>

            {/* ROOMS SECTION */}
            <section style={{ marginBottom: '100px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <h2 className="caps" style={{ fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: '900', opacity: 0.8 }}>"ROOMS"</h2>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.2 }}></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                    {rooms.map((room, idx) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="card-industrial"
                            style={{ padding: '32px', display: 'flex', flexDirection: 'column', minHeight: '300px' }}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="monospaced text-[9px] opacity-40">REF_{room.id}</div>
                                <div className="tag-zip" style={{ background: 'var(--safety-yellow)', color: 'black', fontSize: '8px', margin: 0 }}>LIVE</div>
                            </div>

                            <h3 className="caps" style={{ fontSize: '1.5rem', marginBottom: '12px', lineHeight: 1.1, fontWeight: '900' }}>
                                {room.title}
                            </h3>

                            <p className="opacity-50" style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: 'auto', paddingBottom: '32px' }}>
                                {room.description || 'No description provided.'}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className="opacity-30" />
                                        <span className="monospaced text-[11px] font-black" style={{ color: 'var(--safety-orange)' }}>{room.timer_minutes}M</span>
                                    </div>
                                    <div style={{ width: '1px', height: '12px', background: 'var(--border)', opacity: 0.3 }}></div>
                                    <div className="monospaced text-[10px] opacity-40">AUTO_PURGE</div>
                                </div>

                                <Link to={`/room/${room.id}`} className="btn-industrial" style={{ padding: '6px 16px', fontSize: '10px' }}>
                                    "ACCESS"
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* COMMUNITIES SECTION */}
            <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <h2 className="caps" style={{ fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: '900', opacity: 0.8 }}>"COMMUNITIES"</h2>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.2 }}></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '32px' }}>
                    {events.map((event, idx) => (
                        <Link key={event.id} to={`/event/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className="group"
                                style={{
                                    background: 'var(--black)',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                                    {event.image_url ? (
                                        <img
                                            src={event.image_url}
                                            alt=""
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                                        />
                                    ) : (
                                        <div className="cross-hatch w-full h-full flex items-center justify-center opacity-10">
                                            <Zap size={32} />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-40"></div>

                                    <div className="absolute top-4 left-4">
                                        <div className="bg-black/80 backdrop-blur-md px-2 py-1 border border-white/20 monospaced text-[8px] font-black text-white caps">
                                            {event.category}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-4 left-4">
                                        <div className="monospaced text-[10px] text-white font-black flex items-center gap-2">
                                            <Calendar size={12} className="opacity-50" />
                                            {new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '24px', flex: 1 }}>
                                    <h3 className="caps" style={{
                                        fontSize: '1.5rem',
                                        lineHeight: 1,
                                        fontWeight: '900',
                                        letterSpacing: '-0.02em',
                                        marginBottom: '20px'
                                    }}>
                                        {event.title}
                                    </h3>

                                    {/* NEAT METADATA ROW */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        borderTop: '1px solid var(--border)',
                                        paddingTop: '20px'
                                    }}>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} className="opacity-30" />
                                            <span className="monospaced text-[9px] caps opacity-60 tracking-wider">
                                                {event.location || 'CAMPUS'}
                                            </span>
                                        </div>
                                        <div style={{ width: '4px', height: '1px', background: 'var(--border)', opacity: 0.3 }}></div>
                                        <div className="flex items-center gap-2">
                                            <Users size={12} className="opacity-30" />
                                            <span className="monospaced text-[9px] caps opacity-60 tracking-wider">
                                                {event.capacity ? `${event.capacity} SLOTS` : 'OPEN'}
                                            </span>
                                        </div>
                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-0 group-hover:w-full h-[2px] bg-white transition-all duration-500"></div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            <footer style={{ marginTop: '120px', paddingBottom: '40px' }}>
                <div className="flex justify-between items-center monospaced opacity-20 text-[8px] uppercase tracking-[0.3em]">
                    <span>SECURE_ACCESS_V4.5</span>
                    <span className="opacity-10">////////////////////////////////////////////////////////////</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                </div>
            </footer>

            <style>{`
                .group:hover {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    transform: translateY(-4px);
                }
            `}</style>
        </div>
    );
};

export default Explore;
