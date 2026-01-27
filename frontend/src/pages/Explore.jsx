import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Clock, Calendar, ArrowRight, Zap, Terminal } from 'lucide-react';
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

                const fetchRooms = axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/rooms`, { headers: { Authorization: token } })
                    .then(res => res.data)
                    .catch(err => {
                        console.error("Rooms fetch failed", err);
                        return [];
                    });

                const fetchEvents = axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/events`)
                    .then(res => res.data)
                    .catch(err => {
                        console.error("Events fetch failed", err);
                        return [];
                    });

                const fetchActivities = axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/activities`)
                    .then(res => res.data)
                    .catch(err => {
                        console.error("Activities fetch failed", err);
                        return [];
                    });

                const [roomsData, eventsData, activitiesData] = await Promise.all([fetchRooms, fetchEvents, fetchActivities]);

                setRooms(roomsData || []);
                setEvents(eventsData || []);
                setActivities(activitiesData || []);
            } catch (err) {
                console.error('Error fetching data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const activeRooms = rooms.filter(r => !r.is_closed);

    return (
        <div className="container fade-in">
            <header style={{ marginBottom: '80px', position: 'relative' }}>
                <div className="monospaced" style={{ fontSize: '10px', opacity: 0.3, letterSpacing: '0.2em', marginBottom: '12px' }}>
                    PLATFORM_ACCESS_04
                </div>
                <h1 className="caps" style={{ fontSize: '4rem', letterSpacing: '-0.07em', marginBottom: '8px', lineHeight: 0.85, fontWeight: '900' }}>
                    EXPLORE
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '24px' }}>
                    <span className="monospaced" style={{ fontSize: '11px', opacity: 0.6 }}>
                        ACTIVE_ROOMS & CAMPUS_EVENTS
                    </span>
                    <div style={{ height: '1px', width: '100px', background: 'var(--white)', opacity: 0.2 }}></div>
                    <span className="tag-zip" style={{ background: 'var(--white)', color: 'black', fontSize: '8px' }}>v4.5</span>
                </div>
            </header>

            {/* ACTIVE ROOMS (NODES) SECTION */}
            <section style={{ marginBottom: '80px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <h2 className="caps" style={{ fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: '900', opacity: 0.8 }}>"ACTIVE_NODES"</h2>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.2 }}></div>
                    <div className="monospaced" style={{ fontSize: '10px', opacity: 0.4 }}>{activeRooms.length} ONLINE</div>
                </div>

                {activeRooms.length === 0 ? (
                    <div style={{ padding: '32px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontFamily: 'monospace', fontSize: '12px', opacity: 0.5 }}>
                        // NO ACTIVE ROOMS DETECTED //
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '24px'
                    }}>
                        {activeRooms.map((room) => (
                            <Link to={`/room/${room.id}`} key={room.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="card-industrial" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                                            <Terminal size={20} color="var(--white)" style={{ opacity: 0.7 }} />
                                        </div>
                                        <div className="monospaced" style={{ fontSize: '9px', opacity: 0.4 }}>
                                            REF: {room.id}
                                        </div>
                                    </div>

                                    <h3 className="caps" style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '8px', lineHeight: 1 }}>{room.title}</h3>
                                    <p className="monospaced" style={{ fontSize: '10px', opacity: 0.6, marginBottom: '24px', flex: 1, lineHeight: 1.5 }}>
                                        {room.description || 'NO_DESCRIPTION'}
                                    </p>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div className="monospaced" style={{ fontSize: '12px', fontWeight: 'bold', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }}></span>
                                            LIVE
                                        </div>
                                        <div className="monospaced" style={{ fontSize: '9px', opacity: 0.5 }}>
                                            {room.timer_minutes}M SESSION
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* COMMUNITIES / EVENTS */}
            <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <h2 className="caps" style={{ fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: '900', opacity: 0.8 }}>"EVENTS"</h2>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.2 }}></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
                    {events.map((event, idx) => {
                        const eventActivities = activities.filter(a => a.event_id === event.id);

                        return (
                            <div key={event.id} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                {/* Event Card */}
                                <Link to={`/event/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className="card-industrial"
                                        style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}
                                    >
                                        <div style={{ height: '280px', overflow: 'hidden', position: 'relative', background: '#0a0a0a' }}>
                                            {event.image_url ? (
                                                <img
                                                    src={event.image_url}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                                                />
                                            ) : (
                                                <div className="cross-hatch" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                                                    <Zap size={32} />
                                                </div>
                                            )}

                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000, transparent)', opacity: 0.6 }}></div>

                                            <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                                                <div className="monospaced caps" style={{ background: 'rgba(0,0,0,0.8)', padding: '4px 8px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '8px', color: '#fff' }}>
                                                    {event.category || 'EVENT'}
                                                </div>
                                            </div>

                                            <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
                                                <h3 className="caps" style={{ fontSize: '3rem', fontWeight: '900', lineHeight: 1, marginBottom: '8px' }}>
                                                    {event.title}
                                                </h3>
                                                <div className="monospaced" style={{ fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.8 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Calendar size={12} />
                                                        {new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Clock size={12} />
                                                        {new Date(event.event_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0a0a0a' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <MapPin size={12} style={{ opacity: 0.4 }} />
                                                    <span className="monospaced caps" style={{ fontSize: '9px', opacity: 0.7, letterSpacing: '0.05em' }}>
                                                        {event.location || 'TBH'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Users size={12} style={{ opacity: 0.4 }} />
                                                    <span className="monospaced caps" style={{ fontSize: '9px', opacity: 0.7, letterSpacing: '0.05em' }}>
                                                        {event.capacity ? `${event.capacity} CAP` : 'OPEN'}
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight size={16} />
                                        </div>
                                    </motion.div>
                                </Link>

                                {/* Nested Activities Grid */}
                                {eventActivities.length > 0 && (
                                    <div style={{ marginLeft: '16px', paddingLeft: '24px', borderLeft: '2px dashed rgba(255,255,255,0.1)' }}>
                                        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '6px', height: '6px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%' }}></div>
                                            <span className="monospaced" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>
                                                SUB_ACTIVITIES // {eventActivities.length}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                            gap: '24px'
                                        }}>
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
                    <div style={{ marginTop: '80px', paddingTop: '80px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                            <h2 className="caps" style={{ fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: '900', opacity: 0.6 }}>"OTHER_ACTIVITIES"</h2>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.2 }}></div>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '24px'
                        }}>
                            {activities.filter(a => !a.event_id || a.event_id === '00000000-0000-0000-0000-000000000000').map((activity, idx) => (
                                <ActivityCard key={activity.id} activity={activity} user={user} idx={idx} />
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <footer style={{ marginTop: '120px', paddingBottom: '40px' }}>
                <div className="monospaced flex-between" style={{ fontSize: '8px', opacity: 0.2, textTransform: 'uppercase', letterSpacing: '0.3em' }}>
                    <span>SECURE_ACCESS_V4.5</span>
                    <span style={{ opacity: 0.1 }}>////////////////////////////////////////////////////////////</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                </div>
            </footer>
        </div>
    );
};

export default Explore;
