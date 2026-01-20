import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, Users, ArrowLeft, CheckCircle, QrCode, Shield, Info, Clock, Ticket } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const EventDetails = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        fetchData();
        checkRegistration();
    }, [id]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/events`);
            const found = response.data.find(e => e.id === id);
            setEvent(found);
        } catch (err) {
            console.error('Error fetching event', err);
        } finally {
            setLoading(false);
        }
    };

    const checkRegistration = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/events/registrations`, {
                headers: { Authorization: token }
            });
            const reg = response.data.find(r => r.event_id === id);
            setRegistration(reg);
        } catch (err) {
            console.error('Error checking registration', err);
        }
    };

    const handleRegister = async () => {
        setRegistering(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/events/register`, { event_id: id }, {
                headers: { Authorization: token }
            });
            await checkRegistration();
        } catch (err) {
            alert(err.response?.data || "REGISTRATION_FAILED");
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen bg-black items-center justify-center monospaced caps animate-pulse">
            LOADING_EVENT...
        </div>
    );

    if (!event) return (
        <div className="container py-20 text-center">
            <h1 className="caps text-3xl mb-8">EVENT_NOT_FOUND</h1>
            <button onClick={() => navigate('/explore')} className="btn-industrial">"BACK_TO_EXPLORE"</button>
        </div>
    );

    return (
        <div className="container fade-in">
            <header style={{ marginBottom: '40px' }}>
                <button onClick={() => navigate(-1)} className="btn-industrial flex items-center gap-2 mb-8" style={{ padding: '8px 16px' }}>
                    <ArrowLeft size={14} /> "BACK"
                </button>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.2, marginBottom: '20px' }}></div>
            </header>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Main Event Content */}
                <div className="lg:col-span-2">
                    <div className="card-industrial" style={{ padding: '0', overflow: 'hidden', borderBottom: '8px solid var(--white)' }}>
                        <div style={{ height: '480px', width: '100%', position: 'relative', background: '#0a0a0a' }}>
                            {event.image_url ? (
                                <img src={event.image_url} alt="" className="w-full h-full object-cover opacity-80" />
                            ) : (
                                <div className="cross-hatch w-full h-full flex items-center justify-center opacity-10">
                                    <Ticket size={120} />
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 w-full p-12 bg-gradient-to-t from-black via-black/50 to-transparent">
                                <span className="tag-zip" style={{ background: 'var(--white)', color: 'black', marginBottom: '16px' }}>{event.category.toUpperCase()}</span>
                                <h1 className="caps" style={{ fontSize: '4rem', letterSpacing: '-0.04em', lineHeight: 0.9, fontWeight: '900' }}>
                                    "{event.title}"
                                </h1>
                            </div>
                        </div>

                        <div style={{ padding: '60px' }}>
                            <div className="grid md:grid-cols-2 gap-12 mb-16">
                                <div className="space-y-4">
                                    <div className="monospaced text-[9px] opacity-40 caps tracking-widest">WHEN</div>
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 border border-white/20 bg-white/5">
                                            <Calendar className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <div className="caps font-black text-xl">{new Date(event.event_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</div>
                                            <div className="monospaced text-[12px] opacity-60">{new Date(event.event_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="monospaced text-[9px] opacity-40 caps tracking-widest">WHERE</div>
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 border border-white/20 bg-white/5">
                                            <MapPin className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <div className="caps font-black text-xl">{event.location || 'CAMPUS_GROUNDS'}</div>
                                            <div className="monospaced text-[12px] opacity-60">JSS_SECURE_ZONE</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="monospaced text-[9px] opacity-40 caps tracking-widest">ABOUT</div>
                                <p className="opacity-80 leading-relaxed text-xl font-medium" style={{ borderLeft: '2px solid var(--white)', paddingLeft: '32px' }}>
                                    {event.description || 'No detailed description available for this community event.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registration Sidecard */}
                <div className="lg:col-span-1">
                    <div className="sticky top-12 space-y-8">
                        <div className="card-industrial" style={{ padding: '48px', textAlign: 'center' }}>
                            <div className="card-metadata">ID: {registration ? 'CONFIRMED' : 'WAITING'}</div>

                            {!registration ? (
                                <>
                                    <h3 className="caps text-2xl mb-12 font-black">"GET_ACCESS"</h3>
                                    <div className="space-y-8 mb-16 text-left">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                            <div>
                                                <div className="monospaced text-[9px] opacity-40 caps">CAPACITY</div>
                                                <div className="caps font-bold">{event.capacity || 'UNLIMITED'}</div>
                                            </div>
                                            <Users size={20} className="opacity-20" />
                                        </div>
                                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                            <div>
                                                <div className="monospaced text-[9px] opacity-40 caps">STATUS</div>
                                                <div className="caps font-bold text-green-500">AVAILABLE</div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleRegister}
                                        disabled={registering}
                                        className="btn-industrial w-full justify-center bg-white text-black py-6 text-xl hover:bg-zinc-200 transition-colors"
                                        style={{ fontWeight: '900' }}
                                    >
                                        {registering ? '...WAIT' : '"REGISTER NOW"'}
                                    </button>
                                </>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="tag-zip" style={{ background: 'var(--safety-yellow)', color: 'black', marginBottom: '40px', fontSize: '12px' }}>AUTHORIZED</div>
                                    <h3 className="caps text-2xl mb-12 font-black">"ACCESS_TOKEN"</h3>

                                    <div className="bg-white p-4 inline-block mb-10 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                                        <QRCodeSVG
                                            value={registration.qr_code_token}
                                            size={220}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>

                                    <div className="monospaced text-[10px] opacity-40 mb-10 text-left border-l border-white/20 pl-4 py-2">
                                        USER: {user.usn}<br />
                                        ISSUED: {new Date(registration.CreatedAt).toLocaleDateString()}<br />
                                        STAMP: {new Date(registration.CreatedAt).getTime()}
                                    </div>

                                    <div className="flex items-center gap-3 justify-center text-green-500 monospaced text-xs font-black">
                                        <Shield size={16} /> SECURITY_VALIDATED
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border border-white/10 monospaced text-[9px] leading-relaxed opacity-40">
                            BY REGISTERING, YOU AGREE TO FOLLOW ALL CAMPUS PROTOCOLS AT THE VENUE. ENTRY IS SUBJECT TO CAPACITY LIMITS EVEN WITH A TOKEN.
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .fade-in { animation: slideIn 0.8s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default EventDetails;
