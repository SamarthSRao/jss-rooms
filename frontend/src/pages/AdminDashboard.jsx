import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Calendar, Layout, Copy, Activity, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('rooms');
    const [rooms, setRooms] = useState([]);
    const [events, setEvents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [activities, setActivities] = useState([]);
    const [registrations, setRegistrations] = useState({});
    const [viewingParticipants, setViewingParticipants] = useState(null); // Activity ID
    const [activityRegistrations, setActivityRegistrations] = useState([]);

    // Form states
    const [roomForm, setRoomForm] = useState({ title: '', description: '', timer_minutes: 30 });
    const [eventForm, setEventForm] = useState({ title: '', description: '', category: 'Workshop', event_date: '', location: '', capacity: 0, contact_number: '', image_url: '', block: 'A', floor: '0', room_no: '100' });
    const [groupForm, setGroupForm] = useState({ name: '', description: '' });
    const [activityForm, setActivityForm] = useState({ title: '', description: '', location: '', start_time: '', image_url: '', contact_number: '', block: 'A', floor: '0', room_no: '100' });



    useEffect(() => {
        fetchData();
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

        // Validation
        const phoneRegex = /^(\+91[\-\s]?)?[0-9]{10}$/;
        if (activityForm.contact_number && !phoneRegex.test(activityForm.contact_number)) {
            alert("INVALID CONTACT NUMBER FORMAT. USE: +91 9876543210 OR 9876543210");
            return;
        }

        const roomNum = parseInt(activityForm.room_no);
        if (roomNum < 100 || roomNum > 450) {
            alert("ROOM NUMBER MUST BE BETWEEN 100 AND 450");
            return;
        }

        const locationStr = `BLOCK ${activityForm.block} - FLOOR ${activityForm.floor} - ROOM ${activityForm.room_no}`;

        const token = localStorage.getItem('token');
        const payload = {
            ...activityForm,
            location: locationStr,
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
        setActivityForm({ title: '', description: '', location: '', start_time: '', image_url: '', contact_number: '', block: 'A', floor: '0', room_no: '100' });
        fetchData();
    };

    const closeRoom = async (roomId) => {
        const token = localStorage.getItem('token');
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/rooms/close`, { room_id: roomId }, { headers: { Authorization: token } });
        fetchData();
    };

    const createEvent = async (e) => {
        e.preventDefault();

        // Validation
        const phoneRegex = /^(\+91[\-\s]?)?[0-9]{10}$/;
        if (eventForm.contact_number && !phoneRegex.test(eventForm.contact_number)) {
            alert("INVALID CONTACT NUMBER FORMAT. USE: +91 9876543210 OR 9876543210");
            return;
        }

        if (eventForm.capacity <= 0) {
            alert("CAPACITY MUST BE A POSITIVE INTEGER");
            return;
        }

        const roomNum = parseInt(eventForm.room_no);
        if (roomNum < 100 || roomNum > 450) {
            alert("ROOM NUMBER MUST BE BETWEEN 100 AND 450");
            return;
        }

        const locationStr = `BLOCK ${eventForm.block} - FLOOR ${eventForm.floor} - ROOM ${eventForm.room_no}`;

        const token = localStorage.getItem('token');
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/events`,
            { ...eventForm, location: locationStr, event_date: new Date(eventForm.event_date).toISOString(), organizer_id: user.id },
            { headers: { Authorization: token } }
        );
        setEventForm({ title: '', description: '', category: 'Workshop', event_date: '', location: '', capacity: 0, contact_number: '', image_url: '', block: 'A', floor: '0', room_no: '100' });
        fetchData();
    };

    const deleteEvent = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/events?id=${eventId}`, {
                headers: { Authorization: token }
            });
            fetchData();
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Failed to delete event");
        }
    };

    const copyInviteLink = (roomId) => {
        const link = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard.writeText(link);
        alert('Invite link copied to clipboard!');
    };

    const fetchActivityRegistrations = async (activityId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/activities/registrations?activity_id=${activityId}`, {
                headers: { Authorization: token }
            });
            setActivityRegistrations(res.data || []);
            setViewingParticipants(activityId);
        } catch (error) {
            console.error("Failed to fetch activity registrations", error);
            alert("Failed to load participants");
        }
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

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '40px', alignItems: 'flex-start' }}>
                {/* SIDEBAR NAVIGATION */}
                <div style={{
                    display: isMobile ? 'grid' : 'flex',
                    gridTemplateColumns: isMobile ? '1fr 1fr' : 'none',
                    flexDirection: 'column',
                    width: isMobile ? '100%' : '240px',
                    gap: isMobile ? '12px' : '4px',
                    border: isMobile ? 'none' : '1px solid var(--border)',
                    padding: isMobile ? '0' : '4px',
                    background: isMobile ? 'transparent' : 'var(--bg-card)',
                    position: isMobile ? 'relative' : 'sticky',
                    top: isMobile ? '0' : '20px',
                    flexShrink: 0,
                    marginBottom: isMobile ? '40px' : '0'
                }}>
                    {!isMobile && (
                        <div className="monospaced" style={{ padding: '12px', fontSize: '10px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', marginBottom: '4px', letterSpacing: '0.1em' }}>
                            // SYSTEM_MODULES
                        </div>
                    )}

                    {[
                        { id: 'rooms', label: 'ROOMS', icon: <Layout size={18} /> },
                        { id: 'events', label: 'EVENTS', icon: <Calendar size={18} /> },
                        { id: 'activities', label: 'ACTIVITIES', icon: <Activity size={18} /> },
                        { id: 'groups', label: 'GROUPS', icon: <Users size={18} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="caps"
                            style={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: 'center',
                                justifyContent: isMobile ? 'center' : 'flex-start',
                                gap: '12px',
                                padding: isMobile ? '20px' : '16px 20px',
                                border: '1px solid',
                                borderColor: activeTab === tab.id ? 'var(--black)' : 'var(--border)',
                                background: activeTab === tab.id ? 'var(--white)' : 'var(--bg-main)',
                                color: activeTab === tab.id ? 'var(--black)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab.id ? '900' : '500',
                                fontSize: '12px',
                                height: isMobile ? 'auto' : 'auto',
                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <span style={{ opacity: activeTab === tab.id ? 1 : 0.7 }}>{tab.icon}</span>
                            <span>"{tab.label}"</span>

                            {activeTab === tab.id && !isMobile && (
                                <div style={{ marginLeft: 'auto', width: '6px', height: '6px', background: 'var(--safety-orange)', borderRadius: '50%' }} />
                            )}
                        </button>
                    ))}
                </div>

                {/* MAIN CONTENT AREA */}
                <div style={{ flex: 1, width: '100%' }}>

                    {activeTab === 'rooms' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
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
                                                <button onClick={() => closeRoom(room.id)} className="btn-industrial" style={{ padding: '6px 12px', fontSize: '9px', borderColor: 'var(--safety-orange)', color: 'var(--safety-orange)' }}>
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

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
                                    <div className="input-wrapper">
                                        <label className="input-label">"RESTRICT_TO_GROUP"</label>
                                        <select
                                            className="input-industrial"
                                            value={roomForm.group_id || ''}
                                            onChange={e => setRoomForm({ ...roomForm, group_id: e.target.value })}
                                            style={{ appearance: 'none' }}
                                        >
                                            <option value="">-- NO RESTRICTION --</option>
                                            {groups.map(g => (
                                                <option key={g.id} value={g.id}>{g.name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button type="submit" className="btn-industrial" style={{ background: 'var(--white)', color: 'var(--black)', justifyContent: 'center' }}>
                                        "CREATE"
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
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
                                                <button onClick={() => deleteEvent(event.id)} className="btn-industrial" style={{ padding: '6px 12px', fontSize: '9px', borderColor: 'var(--safety-orange)', color: 'var(--safety-orange)' }}>
                                                    <Trash2 size={12} />
                                                </button>
                                                <button onClick={() => window.location.href = '/admin/checkin'} className="btn-industrial" style={{ padding: '4px 8px', fontSize: '8px' }}>"SCAN"</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

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
                                            <label className="input-label">"LOCATION (BLOCK / FLOOR / ROOM)"</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <select className="input-industrial" style={{ flex: 1 }} value={eventForm.block} onChange={e => setEventForm({ ...eventForm, block: e.target.value })}>
                                                    <option value="A">BLOCK A</option>
                                                    <option value="B">BLOCK B</option>
                                                    <option value="C">BLOCK C</option>
                                                </select>
                                                <select className="input-industrial" style={{ flex: 1 }} value={eventForm.floor} onChange={e => setEventForm({ ...eventForm, floor: e.target.value })}>
                                                    {[0, 1, 2, 3, 4].map(f => (
                                                        <option key={f} value={f}>FLOOR {f}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    className="input-industrial"
                                                    style={{ flex: 1 }}
                                                    placeholder="ROOM"
                                                    min="100"
                                                    max="450"
                                                    value={eventForm.room_no}
                                                    onChange={e => setEventForm({ ...eventForm, room_no: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="input-wrapper">
                                            <label className="input-label">"CAPACITY"</label>
                                            <input type="number" className="input-industrial" value={eventForm.capacity} onChange={e => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) })} />
                                        </div>
                                    </div>
                                    <div className="input-wrapper">
                                        <label className="input-label">"CONTACT_NUMBER"</label>
                                        <input className="input-industrial" value={eventForm.contact_number || ''} onChange={e => setEventForm({ ...eventForm, contact_number: e.target.value })} placeholder="+91..." />
                                    </div>
                                    <div className="input-wrapper">
                                        <label className="input-label">"IMAGE_URL"</label>
                                        <input className="input-industrial" value={eventForm.image_url || ''} onChange={e => setEventForm({ ...eventForm, image_url: e.target.value })} placeholder="https://..." />
                                    </div>
                                    <div className="input-wrapper">
                                        <label className="input-label">"DATE & TIME"</label>
                                        <input type="datetime-local" className="input-industrial" value={eventForm.event_date} onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })} required />
                                    </div>
                                    <div className="input-wrapper">
                                        <label className="input-label">"DESCRIPTION"</label>
                                        <textarea className="input-industrial" style={{ height: '80px', resize: 'none' }} value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn-industrial" style={{ background: 'var(--white)', color: 'var(--black)', justifyContent: 'center' }}>"POST_EVENT"</button>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {activeTab === 'activities' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
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
                                                <button
                                                    onClick={() => fetchActivityRegistrations(activity.id)}
                                                    className="btn-industrial"
                                                    style={{ padding: '6px 12px', fontSize: '9px', marginLeft: '10px' }}
                                                >
                                                    "PARTICIPANTS"
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

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
                                        <label className="input-label">"LOCATION (BLOCK / FLOOR / ROOM)"</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <select className="input-industrial" style={{ flex: 1 }} value={activityForm.block} onChange={e => setActivityForm({ ...activityForm, block: e.target.value })}>
                                                <option value="A">BLOCK A</option>
                                                <option value="B">BLOCK B</option>
                                                <option value="C">BLOCK C</option>
                                            </select>
                                            <select className="input-industrial" style={{ flex: 1 }} value={activityForm.floor} onChange={e => setActivityForm({ ...activityForm, floor: e.target.value })}>
                                                {[0, 1, 2, 3, 4].map(f => (
                                                    <option key={f} value={f}>FLOOR {f}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                className="input-industrial"
                                                style={{ flex: 1 }}
                                                placeholder="ROOM"
                                                min="100"
                                                max="450"
                                                value={activityForm.room_no}
                                                onChange={e => setActivityForm({ ...activityForm, room_no: e.target.value })}
                                                required
                                            />
                                        </div>
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
                                        <label className="input-label">"CONTACT_NUMBER"</label>
                                        <input className="input-industrial" value={activityForm.contact_number} onChange={e => setActivityForm({ ...activityForm, contact_number: e.target.value })} placeholder="+91..." />
                                    </div>
                                    <div className="input-wrapper">
                                        <label className="input-label">"DESCRIPTION"</label>
                                        <textarea className="input-industrial" style={{ height: '80px', resize: 'none' }} value={activityForm.description} onChange={e => setActivityForm({ ...activityForm, description: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn-industrial" style={{ background: 'var(--white)', color: 'var(--black)', justifyContent: 'center' }}>"POST_ACTIVITY"</button>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {activeTab === 'groups' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
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
                                    <button type="submit" className="btn-industrial" style={{ background: 'var(--white)', color: 'var(--black)', justifyContent: 'center' }}>"CREATE"</button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </div>{/* End Main Content Area */}
            </div>{/* End Sidebar Flex Container */}

            <div className="cross-hatch" style={{ height: '20px', width: '100%', marginTop: '60px', opacity: 0.1 }}></div>

            {/* PARTICIPANTS MODAL */}
            {
                viewingParticipants && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(5px)',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="card-industrial"
                            style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', background: 'var(--bg-card)' }}
                        >
                            <div className="flex-between" style={{ marginBottom: '20px' }}>
                                <h3 className="caps">"ACTIVITY_LOG"</h3>
                                <button onClick={() => setViewingParticipants(null)} className="btn-industrial" style={{ padding: '5px 10px' }}>CLOSE</button>
                            </div>

                            {activityRegistrations.length === 0 ? (
                                <p className="monospaced" style={{ opacity: 0.5, textAlign: 'center', padding: '40px' }}>NO_DATA_FOUND</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 1.2fr', padding: '10px', background: 'var(--black)', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                                        <div>USER_DETAILS</div>
                                        <div>TEAM_NAME</div>
                                        <div>STATUS</div>
                                        <div>TIMESTAMP</div>
                                    </div>
                                    {activityRegistrations.map((reg) => (
                                        <div key={reg.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 1.2fr', padding: '15px', background: 'var(--industrial-gray)', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <div className="monospaced" style={{ fontWeight: 'bold', fontSize: '11px' }}>{reg.user_usn || "N/A"}</div>
                                                <div style={{ fontSize: '9px', opacity: 0.5 }}>{reg.user?.name}</div>
                                            </div>
                                            <div className="monospaced" style={{ fontSize: '10px', color: 'var(--safety-yellow)' }}>
                                                {reg.team_name || "INDIVIDUAL"}
                                            </div>
                                            <div>
                                                <span className="tag-zip" style={{
                                                    background: reg.status === 'checked_in' ? 'var(--safety-yellow)' : 'var(--border)',
                                                    color: reg.status === 'checked_in' ? 'black' : 'white',
                                                    marginLeft: 0,
                                                    fontSize: '8px'
                                                }}>
                                                    {reg.status}
                                                </span>
                                            </div>
                                            <div className="monospaced" style={{ fontSize: '9px', opacity: 0.6 }}>
                                                {new Date(reg.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="monospaced" style={{ marginTop: '20px', fontSize: '10px', opacity: 0.5, textAlign: 'right' }}>
                                TOTAL_RECORDS: {activityRegistrations.length}
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminDashboard;
