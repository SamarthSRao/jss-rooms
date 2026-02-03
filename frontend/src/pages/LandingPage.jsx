import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const ctaRef = useRef(null);
    const featuresRef = useRef(null);
    const footerRef = useRef(null);

    // GSAP Animations
    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Changed to Slide UP (y: 50 -> 0) to avoid "floating down" feel
        tl.fromTo(titleRef.current,
            { y: 50, opacity: 0, scale: 0.95 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 1.2,
                delay: 0.2
            }
        )
            .fromTo(subtitleRef.current,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 },
                "-=0.8"
            )
            .fromTo(ctaRef.current,
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.8 },
                "-=0.6"
            )
            .fromTo(featuresRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1 },
                "-=0.6"
            )
            .fromTo(footerRef.current,
                { opacity: 0 },
                { opacity: 0.5, duration: 1 },
                "-=0.5"
            );

        // Simple mouse parallax (keeping it strict and subtle)
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const xPos = (clientX / window.innerWidth - 0.5) * 10;
            const yPos = (clientY / window.innerHeight - 0.5) * 10;

            gsap.to(titleRef.current, {
                x: xPos,
                y: yPos,
                duration: 1,
                ease: "power2.out"
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Technical Background Patterns


    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                minHeight: '100vh', // Allow scrolling if needed
                width: '100vw',
                overflowX: 'hidden', // Prevent horizontal scroll only
                overflowY: 'auto',   // Allow vertical scroll
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between', // Space out header/content/footer
                alignItems: 'center'
            }}
        >
            {/* NEW BACKGROUND: TECHNICAL GRID */}
            {/* DYNAMIC BACKGROUND ELEMENTS */}
            <div className="bg-noise"></div>
            <div className="bg-cyber-grid"></div>
            <div className="scanline"></div>
            <div className="shard shard-orange"></div>
            <div className="shard shard-blue"></div>

            {/* VIGNETTE */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 50% 50%, transparent 0%, #000 120%)',
                zIndex: 1,
                pointerEvents: 'none'
            }}></div>

            {/* OVERLAY PATTERN - Keep Crosshatch for texture */}
            <div className="cross-hatch" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.03,
                pointerEvents: 'none',
                zIndex: 2
            }}></div>

            {/* CONTENT */}
            <div style={{
                zIndex: 10,
                textAlign: 'center',
                padding: '100px 20px 40px', // More top padding
                maxWidth: '1200px',
                width: '100%',
                flex: '1' // Allow this to take up available space
            }}>
                <div className="tag-zip" style={{ marginBottom: '20px', display: 'inline-flex' }}>
                    SYSTEM_READY
                </div>

                <h1 ref={titleRef} className="caps quotes" style={{
                    fontSize: 'clamp(3rem, 8vw, 6rem)',
                    lineHeight: 1,
                    marginBottom: '2rem',
                    letterSpacing: '-0.05em',
                    fontWeight: 900
                }}>
                    JSS ROOMS
                </h1>

                <p ref={subtitleRef} className="monospaced" style={{
                    color: 'var(--text-muted)',
                    maxWidth: '500px',
                    margin: '0 auto 3rem',
                    fontSize: '0.9rem',
                    lineHeight: 1.6
                }}>
                    A UNIFIED PLATFORM FOR CAMPUS CONNECTIVITY.<br />
                    REAL-TIME CHAT, EVENT MANAGEMENT, AND SECURE ACTIVITY TRACKING.
                </p>

                <div ref={ctaRef} style={{ marginBottom: '4rem' }}>
                    <button
                        className="btn-industrial hover-glitch"
                        data-ref="LOGIN"
                        onClick={() => navigate('/login')}
                    >
                        INITIALIZE <span style={{ fontFamily: 'Arial', marginLeft: '5px' }}>→</span>
                    </button>
                </div>

                {/* FEATURE GRID */}
                <div ref={featuresRef} style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px',
                    marginTop: '20px',
                    textAlign: 'left',
                    opacity: 0 // Will be handled by GSAP
                }}>
                    {/* Feature 1 */}
                    <div className="card-industrial" style={{ padding: '24px', backdropFilter: 'blur(5px)', backgroundColor: 'rgba(26, 26, 26, 0.8)' }}>
                        <div className="flex-between" style={{ marginBottom: '15px' }}>
                            <div className="monospaced" style={{ color: 'var(--safety-orange)', fontSize: '10px' }}>01 // CONNECT</div>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--safety-orange)' }}></div>
                        </div>
                        <h3 className="caps" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>TEMP ROOMS</h3>
                        <p className="monospaced" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Create ephemeral, secure chat rooms for quick collaboration. Auto-expiring sessions to ensure privacy and focus.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="card-industrial" style={{ padding: '24px', backdropFilter: 'blur(5px)', backgroundColor: 'rgba(26, 26, 26, 0.8)' }}>
                        <div className="flex-between" style={{ marginBottom: '15px' }}>
                            <div className="monospaced" style={{ color: 'var(--blueprint-blue)', fontSize: '10px' }}>02 // ENGAGE</div>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blueprint-blue)' }}></div>
                        </div>
                        <h3 className="caps" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>CAMPUS EVENTS</h3>
                        <p className="monospaced" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Discover and register for campus activities. Stay updated with real-time event schedules and notifications.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="card-industrial" style={{ padding: '24px', backdropFilter: 'blur(5px)', backgroundColor: 'rgba(26, 26, 26, 0.8)' }}>
                        <div className="flex-between" style={{ marginBottom: '15px' }}>
                            <div className="monospaced" style={{ color: 'var(--white)', fontSize: '10px' }}>03 // VERIFY</div>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--white)' }}></div>
                        </div>
                        <h3 className="caps" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>SECURE ACCESS</h3>
                        <p className="monospaced" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Generated QR-code tokens for event check-ins. A fraud-proof system for reliable attendance tracking.
                        </p>
                    </div>
                </div>
            </div>

            {/* FOOTER METADATA */}
            {/* FOOTER METADATA - Responsive positioning */}
            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '40px',
                marginTop: 'auto', // Pushes to bottom in flex container
                zIndex: 10,
                pointerEvents: 'none' // Allow clicks to pass through if overlays
            }}>
                <div ref={footerRef} className="monospaced" style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    textAlign: 'left'
                }}>
                    <p>FIG. 1.0 "LANDING"</p>
                    <p>LOC: 12.9716° N, 77.5946° E</p>
                    <p>SYS: ONLINE</p>
                </div>

                <div className="monospaced" style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    textAlign: 'right'
                }}>
                    <p>EST. 2026</p>
                    <p>JSS INSTITUTIONS</p>
                    <p>V. 2.1.0 RC</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
