import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, LogOut, Shield } from 'lucide-react';

const Room = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [socket, setSocket] = useState(null);
    const scrollRef = useRef();

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8080/ws?room=${id}&usn=${user.usn}&userId=${user.id}`);

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
        <div className="container" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.2rem' }}>Room Chat</h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Room ID: {id}</p>
                    </div>
                    <button onClick={() => navigate('/explore')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={18} /> Exit
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            style={{
                                alignSelf: msg.user_id === user.id ? 'flex-end' : 'flex-start',
                                maxWidth: '70%'
                            }}
                        >
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textAlign: msg.user_id === user.id ? 'right' : 'left' }}>
                                {msg.user_usn} {msg.user_id === user.id && '(You)'}
                            </div>
                            <div style={{
                                padding: '10px 16px',
                                borderRadius: '16px',
                                background: msg.user_id === user.id ? 'var(--primary)' : 'var(--bg-card)',
                                border: msg.user_id === user.id ? 'none' : '1px solid var(--border)',
                                fontSize: '14px'
                            }}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>

                <form onSubmit={sendMessage} style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '12px' }}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Room;
