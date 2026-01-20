import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { QrCode, CheckCircle, XCircle, ArrowLeft, RefreshCw, Activity, Terminal, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const CheckIn = () => {
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [scannedData, setScannedData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
                const minDimension = Math.min(viewfinderWidth, viewfinderHeight);
                const qrboxSize = Math.floor(minDimension * 0.7);
                return { width: qrboxSize, height: qrboxSize };
            },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
        });

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText) {
            scanner.clear();
            processCheckIn(decodedText);
        }

        function onScanFailure(error) {
            // Silence minor scanning noise
        }

        return () => {
            scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        };
    }, []);

    const processCheckIn = async (token) => {
        setLoading(true);
        setError(null);
        setScanResult(null);
        try {
            const apiToken = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/events/checkin`,
                { qr_code_token: token },
                { headers: { Authorization: apiToken } }
            );
            setScanResult('success');
            setScannedData(response.data);
        } catch (err) {
            setScanResult('error');
            setError(err.response?.data || "SYSTEM_ERROR // SCAN_REJECTED");
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        window.location.reload();
    };

    return (
        <div className="container fade-in" style={{ padding: '20px', maxWidth: '800px' }}>
            <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate(-1)} className="btn-industrial" style={{ padding: '10px' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="monospaced caps" style={{ fontSize: '9px', opacity: 0.5 }}>REF. 909 // VALIDATION</div>
                        <h1 className="caps" style={{ fontSize: '1.8rem', letterSpacing: '-0.02em', lineHeight: 1 }}>"SCANNER"</h1>
                    </div>
                </div>
                <div className="tag-zip" style={{ background: scanResult === 'success' ? '#00FF00' : scanResult === 'error' ? '#FF0000' : 'var(--safety-yellow)' }}>
                    {scanResult === 'success' ? 'AUTHORIZED' : scanResult === 'error' ? 'DENIED' : 'ACTIVE_LENS'}
                </div>
            </header>

            <div className="space-y-6">
                {/* Scanner Section */}
                <div className="relative overflow-hidden card-industrial" style={{ padding: '0', background: 'var(--black)', borderColor: 'var(--white)' }}>
                    {!scanResult && !loading && (
                        <div id="reader" style={{ width: '100%', border: 'none' }}></div>
                    )}

                    <AnimatePresence mode="wait">
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center p-20 bg-black min-h-[300px]"
                            >
                                <RefreshCw className="animate-spin mb-6 text-white" size={40} />
                                <div className="monospaced caps text-[10px] tracking-widest">DECODING_TOKEN...</div>
                            </motion.div>
                        )}

                        {scanResult === 'success' && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="p-10 text-center bg-black border-2 border-white min-h-[300px] flex flex-col justify-center items-center"
                            >
                                <CheckCircle size={60} className="mb-6 text-white" />
                                <h2 className="caps text-3xl mb-4 font-black">LOGIN_APPROVED</h2>
                                <div className="monospaced text-[11px] opacity-60 mb-10 pb-4 border-b border-white/10 w-full max-w-xs">
                                    USER_ID: {scannedData?.user_id?.substring(0, 16).toUpperCase()}...<br />
                                    ENTRY_TIME: {new Date().toLocaleTimeString()}
                                </div>
                                <button onClick={resetScanner} className="btn-industrial w-full max-w-xs justify-center bg-white text-black py-4">
                                    "NEXT_ENTRY"
                                </button>
                            </motion.div>
                        )}

                        {scanResult === 'error' && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="p-10 text-center bg-black border-2 border-red-500 min-h-[300px] flex flex-col justify-center items-center"
                            >
                                <XCircle size={60} className="mb-6 text-red-500" />
                                <h2 className="caps text-3xl mb-4 font-black text-red-500">ACCESS_DENIED</h2>
                                <p className="monospaced text-[10px] mb-10 italic">{error}</p>
                                <button onClick={resetScanner} className="btn-industrial w-full max-w-xs justify-center border-red-500 text-red-500 py-4">
                                    "REATTEMPT_SCAN"
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Industrial Overlays */}
                    {!scanResult && !loading && (
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[12px] border-black opacity-20"></div>
                    )}
                </div>

                {/* Status Bar */}
                <div className="card-industrial py-4 px-6 flex justify-between items-center overflow-hidden">
                    <div className="flex items-center gap-4">
                        <Camera size={14} className="opacity-40" />
                        <div className="monospaced text-[9px] opacity-40">
                            FEED: OPTICAL_V1 <br />
                            STAMP: {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                    <div className="monospaced text-[8px] opacity-40 text-right">
                        SYSTEM_PROTOCOL: VO-44<br />
                        JSS_SECURE_NODE_1
                    </div>
                </div>

                {/* Instructions - Only show when waiting */}
                {!scanResult && !loading && (
                    <div className="p-4 monospaced text-[10px] opacity-30 text-center border-t border-dashed border-white/20 pt-8">
                        "POSITION_SUBJECT_QR_TOKEN_WITHIN_BOUNDS"
                    </div>
                )}
            </div>

            {/* Mobile Footer Spacing */}
            <div style={{ height: '60px' }}></div>
        </div>
    );
};

export default CheckIn;
