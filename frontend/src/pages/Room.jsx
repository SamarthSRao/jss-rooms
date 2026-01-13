import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, LogOut, Terminal, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Room = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [socket, setSocket] = useState(null);
    const scrollRef = useRef();

    useEffect(() => {
        const ws = new WebSocket(`${import.meta.env.VITE_WS_BASE_URL}/ws?room=${id}&usn=${user.usn}&userId=${user.id}`);

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            setMessages((prev) => [...prev, msg]);
        };

        setSocket(ws);

        return () => ws.close();
    }, [id, user]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() && socket) {
            socket.send(input);
            setInput('');
        }
    };

    return (
        <div className="container fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <div className="card-industrial" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0', border: '2px solid var(--white)' }}>
                <div className="card-metadata">SRC: WEBSOCKET_ALPHA</div>

                <div style={{ padding: '24px 40px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--industrial-gray)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Terminal size={20} color="var(--safety-orange)" />
                        <div>
                            <h2 className="caps" style={{ fontSize: '1.2rem', letterSpacing: '-0.02em' }}>"NODE_CHAT"</h2>
                            <div className="monospaced" style={{ fontSize: '9px', opacity: 0.5 }}>CHANNELID: {id.substring(0, 8)}...</div>
                        </div>
                        <span className="tag-zip" style={{ background: 'var(--safety-yellow)' }}>ENCRYPTED</span>
                    </div>

                    <button
                        onClick={() => navigate('/explore')}
                        className="btn-industrial hover-glitch"
                        style={{ padding: '8px 20px', fontSize: '10px' }}
                        data-ref="EXIT_04"
                    >
                        "EXIT" <LogOut size={14} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--black)' }} className="cross-hatch">
                    {messages.map((msg, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: msg.user_id === user.id ? 10 : -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={idx}
                            style={{
                                alignSelf: msg.user_id === user.id ? 'flex-end' : 'flex-start',
                                maxWidth: '65%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.user_id === user.id ? 'flex-end' : 'flex-start'
                            }}
                        >
                            <div className="monospaced caps" style={{ fontSize: '9px', opacity: 0.5, marginBottom: '6px' }}>
                                {msg.user_usn} {msg.user_id === user.id ? '// AUTHOR' : '// SENDER'}
                            </div>
                            <div style={{
                                padding: '12px 20px',
                                background: msg.user_id === user.id ? 'var(--white)' : 'var(--industrial-gray)',
                                color: msg.user_id === user.id ? 'var(--black)' : 'var(--white)',
                                border: msg.user_id === user.id ? 'none' : '1px solid var(--white)',
                                fontSize: '14px',
                                fontWeight: '500',
                                position: 'relative'
                            }}>
                                {msg.content}
                                <div style={{ position: 'absolute', bottom: '-15px', right: '0', fontSize: '7px', opacity: 0.3 }} className="monospaced">
                                    MSG_ID: {idx.toString().padStart(4, '0')}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={scrollRef} />
                </div>

                <form onSubmit={sendMessage} style={{ padding: '30px 40px', borderTop: '1px solid var(--border)', display: 'flex', gap: '20px', background: 'var(--black)' }}>
                    <div style={{ flex: 1 }}>
                        <label className="input-label">"INPUT_FIELD"</label>
                        <input
                            type="text"
                            className="input-industrial"
                            placeholder="COMMUNICATE..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            style={{ border: '1px solid var(--white)' }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-industrial"
                        style={{ height: '52px', marginTop: '18px', background: 'var(--white)', color: 'var(--black)' }}
                        data-ref="POST"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', opacity: 0.4 }} className="monospaced caps">
                <div style={{ fontSize: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Activity size={10} /> STREAM_STATUS: NOMINAL
                </div>
                <div style={{ fontSize: '8px' }}>BAUD_RATE: 9600 // REF. 0X9F3</div>
            </div>
        </div>
    );
};

export default Room;

