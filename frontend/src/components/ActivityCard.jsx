import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ActivityCard = ({ activity, user, idx }) => {
    const [status, setStatus] = useState('IDLE'); // IDLE, LOADING, SUCCESS, ERROR
    const [msg, setMsg] = useState('');

    const handleRegister = async () => {
        if (!user) {
            setMsg('LOGIN_REQUIRED');
            setStatus('ERROR');
            return;
        }
        setStatus('LOADING');
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/activities/register`,
                { activity_id: activity.id },
                { headers: { Authorization: token } }
            );
            setStatus('SUCCESS');
            setMsg('REGISTERED');
        } catch (error) {
            console.error(error);
            setStatus('ERROR');
            if (error.response?.status === 409) {
                setMsg('ALREADY_REG');
            } else {
                setMsg('FAILED');
            }
        }
        setTimeout(() => { if (status !== 'SUCCESS') setStatus('IDLE'); }, 3000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="card-industrial relative overflow-hidden"
            style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}
        >
            <div className="relative h-48 overflow-hidden bg-zinc-900 border-b border-white/10">
                {activity.image_url ? (
                    <img src={activity.image_url} alt="" className="w-full h-full object-cover opacity-70" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10 cross-hatch">
                        <span className="monospaced text-xs">NO_SIGNAL</span>
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span className="tag-zip bg-black/50 backdrop-blur text-white border border-white/20">
                        ACT_ID // {activity.id.substring(0, 4)}
                    </span>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <h3 className="caps text-2xl font-black leading-none mb-4">{activity.title}</h3>
                <p className="opacity-60 text-xs leading-relaxed mb-6 line-clamp-3">
                    {activity.description || "No description available."}
                </p>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center gap-4 monospaced text-[10px] opacity-70">
                        <div className="flex items-center gap-2">
                            <MapPin size={12} /> {activity.location || 'TBA'}
                        </div>
                        <div className="w-[1px] h-3 bg-white/20"></div>
                        <div className="flex items-center gap-2">
                            <Calendar size={12} />
                            {new Date(activity.start_time).toLocaleDateString()}
                        </div>
                    </div>

                    <button
                        onClick={handleRegister}
                        disabled={status === 'LOADING' || status === 'SUCCESS'}
                        className={`btn-industrial w-full justify-center text-xs ${status === 'SUCCESS' ? 'bg-green-900/20 border-green-500/50 text-green-500' : ''}`}
                    >
                        {status === 'LOADING' && "PROCESSING..."}
                        {status === 'SUCCESS' && <><CheckCircle size={12} className="mr-2" /> REGISTERED</>}
                        {status === 'ERROR' && <><AlertCircle size={12} className="mr-2" /> {msg}</>}
                        {status === 'IDLE' && `"REGISTER_USN"`}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ActivityCard;
