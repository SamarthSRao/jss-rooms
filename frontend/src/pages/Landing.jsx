import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container fade-in">
            {/* BACKGROUND DECORATION */}
            <div className="construction-lines">
                <div className="line line-v" style={{ left: '10%' }}></div>
                <div className="line line-v" style={{ left: '50%' }}></div>
                <div className="line line-h" style={{ top: '20%' }}></div>
                <div className="line line-h" style={{ top: '80%' }}></div>
            </div>

            {/* METADATA CORNER - TOP LEFT */}
            <div className="metadata top-left monospaced">
                "LANDING_SURFACE"<br />
                REF. NO. 2026-V1<br />
                C/O JSS ROOMS ©2026
            </div>

            {/* METADATA CORNER - TOP RIGHT */}
            <div className="metadata top-right monospaced text-right">
                V.2.1-BETA<br />
                "PROTOTYPE"
            </div>

            {/* MAIN CONTENT */}
            <main className="hero-section">
                <div className="hero-content">
                    <div className="stencil-text caps">
                        <span className="quotes">SPACE</span>
                    </div>

                    <h1 className="hero-title caps">
                        "PRIVATE"<br />
                        RESERVATIONS<br />
                        <span className="opacity-60">SYSTEM</span>
                    </h1>

                    <div className="tag-zip">
                        "ACCESS REQUIRED"
                    </div>

                    <p className="hero-description monospaced opacity-60">
                        INDUSTRIAL-GRADE ROOM SELECTION AND MANAGEMENT INTERFACE.
                        DESIGNED FOR SCALABLE SPATIAL ALLOCATION.
                    </p>

                    <div className="cta-group">
                        <button
                            className="btn-industrial hover-glitch"
                            onClick={() => navigate('/login')}
                            data-ref="AUTHENTICATE"
                        >
                            <span className="quotes">SIGN IN</span>
                        </button>
                        <button
                            className="btn-industrial-outline"
                            onClick={() => navigate('/explore')}
                            style={{ marginLeft: '20px' }}
                        >
                            "EXPLORE"
                        </button>
                    </div>
                </div>

                {/* ASYMMETRIC DECORATION */}
                <div className="asymmetric-image cross-hatch">
                    <div className="image-overlay">
                        <div className="qr-code-aesthetic monospaced">
                            [00:00:00:00]<br />
                            LAT: 12.9716<br />
                            LONG: 77.5946
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER METADATA */}
            <footer className="landing-footer flex-between monospaced">
                <div className="opacity-30">
                    FOR SAMPLE PURPOSES ONLY // NOT FOR INDIVIDUAL SALE
                </div>
                <div className="opacity-30">
                    "©" JSS ROOMS CORP.
                </div>
            </footer>
        </div>
    );
};

export default Landing;
