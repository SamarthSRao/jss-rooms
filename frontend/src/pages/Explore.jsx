import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Clock, Calendar, ArrowRight, Zap, Terminal, ChevronRight } from 'lucide-react';

const ScrollSection = ({ children, className }) => {
    const containerRef = React.useRef(null);

    const handleScroll = (direction) => {
        if (containerRef.current) {
            const scrollAmount = direction === 'right' ? 300 : -300;
            containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div style={{ position: 'relative', group: 'scroll-group' }}>
            <div
                ref={containerRef}
                className={`hide-scrollbar ${className || ''}`}
                style={{
                    display: 'flex',
                    gap: '24px',
                    overflowX: 'auto',
                    paddingBottom: '20px',
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {children}
            </div>

            {/* Right Scroll Gradient & Button */}
            <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 20, // Match paddingBottom
                width: '100px',
                background: 'linear-gradient(to right, transparent, var(--bg-main))',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '10px'
            }}>
                <button
                    onClick={() => handleScroll('right')}
                    style={{
                        pointerEvents: 'auto',
                        background: 'rgba(24, 24, 27, 0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.2s ease'
                    }}
                    className="hover-scale"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

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
    // Filter events for the last 24 hours and future
    const dbEvents = events.filter(e => new Date(e.event_date) > new Date(Date.now() - 86400000)).sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    // PREVIEW EVENT FOR VISUALIZATION
    const ongoingEvents = [
        {
            id: 'preview-aikyam',
            title: 'AIKYAM 2025',
            description: '24 Hour Offline Hackathon presented by Dept of CSE (AI & ML). Prize Pool: 30K',
            category: 'HACKATHON',
            event_date: new Date('2025-03-06T09:00:00').toISOString(),
            location: 'JSSATE-B',
            capacity: 100,
            image_url: '/aikyam_poster.jpg'
        },
        ...dbEvents
    ];

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
                        ACTIVE_ROOMS & CAMPUS_ACTIVITIES
                    </span>
                    <div style={{ height: '1px', width: '100px', background: 'var(--white)', opacity: 0.2 }}></div>
                    <span className="tag-zip" style={{ background: 'var(--white)', color: 'black', fontSize: '8px' }}>v4.6</span>
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

            {/* ONGOING EVENTS SECTION */}
            <section style={{ marginBottom: '80px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <h2 className="caps" style={{ fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: '900', opacity: 0.8 }}>"ONGOING_EVENTS"</h2>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.2 }}></div>
                    <div className="monospaced" style={{ fontSize: '10px', opacity: 0.4 }}>{ongoingEvents.length} SCHEDULED</div>
                </div>

                {ongoingEvents.length === 0 ? (
                    <div style={{ padding: '32px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontFamily: 'monospace', fontSize: '12px', opacity: 0.5 }}>
                        // NO EVENTS SCHEDULED //
                    </div>
                ) : (
                    <ScrollSection>
                        {ongoingEvents.map((event) => (
                            <Link to={`/event/${event.id}`} key={event.id} style={{ textDecoration: 'none', color: 'inherit', minWidth: '280px', scrollSnapAlign: 'start' }}>
                                <div className="card-industrial" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    {/* Image Container - Vertical Aspect Ratio */}
                                    <div style={{
                                        width: '100%',
                                        aspectRatio: '3/4',
                                        background: event.image_url ? `url(${event.image_url})` : '#0a0a0a',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        position: 'relative',
                                        borderBottom: '1px solid var(--border)'
                                    }}>
                                        {!event.image_url && (
                                            <div className="cross-hatch" style={{ width: '100%', height: '100%', opacity: 0.1 }}></div>
                                        )}
                                        <div style={{ position: 'absolute', top: 12, left: 12 }}>
                                            <div className="tag-zip" style={{ background: 'var(--safety-orange)', color: 'black' }}>
                                                {event.category || 'EVENT'}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
                                        <div className="monospaced" style={{ fontSize: '9px', opacity: 0.4, marginBottom: '8px' }}>
                                            {new Date(event.event_date).toLocaleDateString()}
                                        </div>

                                        <h3 className="caps" style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '8px', lineHeight: 1 }}>{event.title}</h3>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', opacity: 0.6 }}>
                                            <MapPin size={12} />
                                            <span className="monospaced" style={{ fontSize: '10px' }}>{event.location || 'TBA'}</span>
                                        </div>

                                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div className="monospaced" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={10} />
                                                {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {event.capacity > 0 && (
                                                <div className="monospaced" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Users size={10} />
                                                    CAP: {event.capacity}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </ScrollSection>
                )}
            </section>

            {/* ACTIVITIES SECTION */}
            <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <h2 className="caps" style={{ fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: '900', opacity: 0.8 }}>"ACTIVITIES"</h2>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.2 }}></div>
                </div>

                <ScrollSection>
                    {activities.map((activity) => {
                        const parentEvent = events.find(e => e.id === activity.event_id);

                        return (
                            <Link to={`/activity/${activity.id}`} key={activity.id} style={{ textDecoration: 'none', color: 'inherit', minWidth: '280px', scrollSnapAlign: 'start' }}>
                                <div className="card-industrial" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <div style={{
                                        width: '100%',
                                        aspectRatio: '3/4',
                                        background: activity.image_url ? `url(${activity.image_url})` : '#0a0a0a',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        position: 'relative',
                                        borderBottom: '1px solid var(--border)'
                                    }}>
                                        {!activity.image_url && (
                                            <div className="cross-hatch" style={{ width: '100%', height: '100%', opacity: 0.1 }}></div>
                                        )}

                                        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div className="tag-zip" style={{ background: 'var(--blueprint-blue)', color: 'white' }}>
                                                ACTIVITY
                                            </div>
                                            {parentEvent && (
                                                <div className="monospaced caps" style={{ background: 'rgba(0,0,0,0.8)', padding: '2px 6px', fontSize: '8px', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                    {parentEvent.title}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
                                        <div className="monospaced" style={{ fontSize: '9px', opacity: 0.4, marginBottom: '8px' }}>
                                            {new Date(activity.start_time).toLocaleDateString()}
                                        </div>

                                        <h3 className="caps" style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '8px', lineHeight: 1 }}>{activity.title}</h3>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', opacity: 0.6 }}>
                                            <MapPin size={12} />
                                            <span className="monospaced" style={{ fontSize: '10px' }}>{activity.location || 'CAMPUS'}</span>
                                        </div>

                                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div className="monospaced" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={10} />
                                                {new Date(activity.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="monospaced" style={{ fontSize: '9px', fontWeight: 'bold' }}>
                                                VIEW <ArrowRight size={10} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </ScrollSection>
            </section>

            <footer style={{ marginTop: '120px', paddingBottom: '40px' }}>
                <div className="monospaced flex-between" style={{ fontSize: '8px', opacity: 0.2, textTransform: 'uppercase', letterSpacing: '0.3em' }}>
                    <span>SECURE_ACCESS_V4.6</span>
                    <span style={{ opacity: 0.1 }}>////////////////////////////////////////////////////////////</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                </div>
            </footer>
        </div>
    );
};

export default Explore;
