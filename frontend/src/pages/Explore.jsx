import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Clock, Calendar, ArrowRight, Zap, ExternalLink } from 'lucide-react';
import ActivityCard from '../components/ActivityCard';

const Explore = ({ user }) => {
    const [rooms, setRooms] = useState([]);
    const [events, setEvents] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [roomsRes, eventsRes, activitiesRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/rooms`, { headers: { Authorization: token } }),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/events`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/activities`)
                ]);
                setRooms(roomsRes.data || []);
                setEvents(eventsRes.data || []);
                setActivities(activitiesRes.data || []);
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

            {/* COMMUNITIES / EVENTS WITH NESTED ACTIVITIES */}
            <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <h2 className="caps" style={{ fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: '900', opacity: 0.8 }}>"COMMUNITIES"</h2>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.2 }}></div>
                </div>

                <div className="space-y-12">
                    {events.map((event, idx) => {
                        const eventActivities = activities.filter(a => a.event_id === event.id);

                        return (
                            <div key={event.id} className="flex flex-col gap-6">
                                {/* Event Card */}
                                <Link to={`/event/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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

                                {/* Nested Activities Grid */}
                                {eventActivities.length > 0 && (
                                    <div className="pl-8 border-l border-dashed border-white/20">
                                        <div className="mb-4 flex items-center gap-2 opacity-50">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                            <span className="monospaced text-xs">EVENT_ACTIVITIES // {eventActivities.length}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {eventActivities.map((activity, aIdx) => (
                                                <ActivityCard key={activity.id} activity={activity} user={user} idx={aIdx} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Unlinked / Global Activities */}
                {activities.filter(a => !a.event_id || a.event_id === '00000000-0000-0000-0000-000000000000').length > 0 && (
                    <div className="mt-20">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                            <h2 className="caps" style={{ fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: '900', opacity: 0.8 }}>"GLOBAL_ACTIVITIES"</h2>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.2 }}></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activities.filter(a => !a.event_id || a.event_id === '00000000-0000-0000-0000-000000000000').map((activity, idx) => (
                                <ActivityCard key={activity.id} activity={activity} user={user} idx={idx} />
                            ))}
                        </div>
                    </div>
                )}
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
