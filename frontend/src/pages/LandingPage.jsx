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

    const [activeFaq, setActiveFaq] = React.useState(null);

    const faqData = [
        {
            q: "What is ANVESHAN?",
            a: "ANVESHAN is a unified campus platform designed to bridge the gap between students, departments, and industrial opportunities through real-time collaboration."
        },
        {
            q: "Who can participate?",
            a: "All JSS Institutions students are eligible. External participants may join specific open-innovation tracks as per the event protocol."
        },
        {
            q: "How do QR check-ins work?",
            a: "Your profile generates a unique encrypted token. Scanning this at the venue logs your attendance and unlocks session-specific hardware assets."
        },
        {
            q: "Is there a registration fee?",
            a: "Core platform access and internal campus events are free. Premium industrial workshops may carry a nominal logistics fee."
        }
    ];

    // GSAP Animations
    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

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

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const xPos = (clientX / window.innerWidth - 0.5) * 10;
            const yPos = (clientY / window.innerHeight - 0.5) * 10;

            if (titleRef.current) {
                gsap.to(titleRef.current, {
                    x: xPos,
                    y: yPos,
                    duration: 1,
                    ease: "power2.out"
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                minHeight: '100vh',
                width: '100vw',
                overflowX: 'hidden',
                overflowY: 'auto',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <div className="bg-noise"></div>
            <div className="bg-cyber-grid"></div>
            <div className="shard shard-purple"></div>
            <div className="shard shard-purple-small"></div>

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
                padding: '100px 20px 40px',
                maxWidth: '1200px',
                width: '100%',
                flex: '1'
            }}>
                <div className="tag-zip" style={{ marginBottom: '20px', display: 'inline-flex' }}>
                    SYSTEM_READY
                </div>

                <h1 ref={titleRef} className="caps" style={{
                    fontSize: 'clamp(3rem, 10vw, 8rem)',
                    lineHeight: 1,
                    marginBottom: '2rem',
                    letterSpacing: '0.05em',
                    fontWeight: 200,
                    textShadow: '0 0 20px rgba(255,255,255,0.2)'
                }}>
                    ANVESHAN<br /><span style={{ fontWeight: 800 }}>2026</span>
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

                <div ref={ctaRef} style={{ marginBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            className="btn-industrial hover-glitch"
                            data-ref="EXPLORE"
                            onClick={() => navigate('/explore')}
                            style={{
                                borderRadius: '99px',
                                padding: '16px 48px',
                                borderColor: 'var(--white)',
                                background: 'transparent',
                                backdropFilter: 'blur(10px)',
                                fontSize: '0.9rem',
                                letterSpacing: '0.1em'
                            }}
                        >
                            EXPLORE  <span style={{ marginLeft: '10px' }}>→</span>
                        </button>
                        <button
                            className="btn-industrial hover-glitch"
                            data-ref="INITIALIZE"
                            onClick={() => navigate('/login')}
                            style={{
                                borderRadius: '99px',
                                padding: '16px 48px',
                                borderColor: 'var(--accent-purple)',
                                background: 'rgba(120, 50, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                fontSize: '0.9rem',
                                letterSpacing: '0.1em'
                            }}
                        >
                            USER LOGIN <span style={{ marginLeft: '10px' }}></span>
                        </button>
                    </div>
                    <p style={{ marginTop: '10px', fontSize: '12px', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.6)' }} className="caps">Public Access Enabled</p>
                </div>

                {/* EVENTS LIST */}
                <div ref={featuresRef} style={{
                    maxWidth: '850px',
                    margin: '80px auto 0',
                    textAlign: 'left',
                    opacity: 0,
                    position: 'relative',
                    zIndex: 10
                }}>
                    <div className="schedule-section-header caps">
                        <span style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '0.05em' }}>
                            FEBRUARY_21
                        </span>
                        <div className="monospaced" style={{ fontSize: '10px', opacity: 0.9, letterSpacing: '0.15em' }}>
                            SYS_STAT: INITIALIZED // HUB_LOC: ANVESHAN_L01
                        </div>
                    </div>

                    <div className="schedule-section-content">
                        <div className="cross-hatch" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none' }}></div>

                        <div className="phase-header" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                            <h2 className="caps" style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', margin: 0, lineHeight: 1 }}>
                                PHASE_01 <span style={{ opacity: 0.3 }}>|</span> THE_INCEPTION
                            </h2>
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--accent-purple), transparent)', opacity: 0.4 }}></div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="event-row">
                                <div className="monospaced" style={{ fontSize: '12px', color: 'var(--accent-purple)', fontWeight: 'bold', paddingTop: '4px' }}>
                                    09:00 — 11:00
                                </div>
                                <div>
                                    <h3 className="caps" style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'white', letterSpacing: '0.05em' }}>Arrival & Registration</h3>
                                    <p className="monospaced" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        Teams verification, biometric check-in, and hardware asset distribution at the main lobby terminal.
                                    </p>
                                </div>
                            </div>

                            <div className="event-row">
                                <div className="monospaced" style={{ fontSize: '12px', color: 'var(--accent-purple)', fontWeight: 'bold', paddingTop: '4px' }}>
                                    11:00 — 12:30
                                </div>
                                <div>
                                    <h3 className="caps" style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'white', letterSpacing: '0.05em' }}>Opening Keynote</h3>
                                    <p className="monospaced" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        Vision of ANVESHAN 26, keynote by industry leaders, and technical protocol briefing.
                                    </p>
                                </div>
                            </div>

                            <div className="event-row">
                                <div className="monospaced" style={{ fontSize: '12px', color: '#22c55e', fontWeight: 'bold', paddingTop: '4px' }}>
                                    12:30 — ∞
                                </div>
                                <div>
                                    <h3 className="caps" style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'white', letterSpacing: '0.05em' }}>The Reveal</h3>
                                    <p className="monospaced" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        Problem statements unlocked. System initialization. The hacking phase begins across all sectors.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ABOUT US SECTION */}
                <section style={{ marginTop: '120px', textAlign: 'left', maxWidth: '850px', margin: '120px auto 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                        <h2 className="caps" style={{ fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: '900', opacity: 0.8 }}>MISSION_STATEMENT</h2>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.2 }}></div>
                    </div>
                    <div className="card-industrial" style={{ padding: '40px' }}>
                        <p className="monospaced" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
                            ANVESHAN is more than a platform; it's a technical ecosystem built on the principles of <span style={{ color: 'var(--accent-purple)' }}>open innovation</span> and <span style={{ color: 'var(--accent-purple)' }}>secure collaboration</span>.
                            Our mission is to empower the next generation of engineers by providing the infrastructure they need to build, connect, and verify their ideas in real-world scenarios.
                        </p>
                        <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div style={{ padding: '20px', borderLeft: '2px solid var(--accent-purple)', background: 'rgba(255,255,255,0.02)' }}>
                                <h4 className="caps" style={{ fontSize: '0.8rem', marginBottom: '5px' }}>Infrastructure</h4>
                                <p className="monospaced" style={{ fontSize: '0.7rem', opacity: 0.6 }}>High-availability campus nodes.</p>
                            </div>
                            <div style={{ padding: '20px', borderLeft: '2px solid var(--accent-purple)', background: 'rgba(255,255,255,0.02)' }}>
                                <h4 className="caps" style={{ fontSize: '0.8rem', marginBottom: '5px' }}>Security</h4>
                                <p className="monospaced" style={{ fontSize: '0.7rem', opacity: 0.6 }}>End-to-end encrypted room logic.</p>
                            </div>
                            <div style={{ padding: '20px', borderLeft: '2px solid var(--accent-purple)', background: 'rgba(255,255,255,0.02)' }}>
                                <h4 className="caps" style={{ fontSize: '0.8rem', marginBottom: '5px' }}>Scale</h4>
                                <p className="monospaced" style={{ fontSize: '0.7rem', opacity: 0.6 }}>Optimized for 10k+ concurrent users.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ SECTION */}
                <section style={{ marginTop: '120px', maxWidth: '850px', margin: '120px auto 0' }}>
                    <h2 className="caps" style={{
                        fontSize: 'clamp(2rem, 5vw, 4rem)',
                        marginBottom: '60px',
                        fontWeight: '900',
                        textAlign: 'center'
                    }}>
                        FREQUENTLY ASKED <span style={{
                            background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-secondary))',
                            WebkitBackgroundClip: 'text',
                            WebkitFillColor: 'transparent',
                            textShadow: '0 0 30px rgba(120, 50, 255, 0.3)'
                        }}>QUESTIONS</span>
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {faqData.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                className="card-industrial hover-glitch"
                                style={{
                                    padding: '24px 32px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    borderColor: activeFaq === index ? 'var(--accent-purple)' : 'var(--border)',
                                    background: activeFaq === index ? 'rgba(120, 50, 255, 0.05)' : 'rgba(255,255,255,0.02)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 className="monospaced" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{item.q}</h3>
                                    <span style={{
                                        color: 'var(--accent-purple)',
                                        fontSize: '1.5rem',
                                        transform: activeFaq === index ? 'rotate(45deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s ease'
                                    }}>+</span>
                                </div>
                                {activeFaq === index && (
                                    <p className="monospaced" style={{
                                        marginTop: '20px',
                                        fontSize: '0.9rem',
                                        color: 'var(--text-muted)',
                                        lineHeight: '1.6',
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        paddingTop: '20px'
                                    }}>
                                        {item.a}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* CONTACT US SECTION */}
                <section style={{ marginTop: '120px', maxWidth: '850px', margin: '120px auto 120px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '60px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.2 }}></div>
                        <h2 className="caps" style={{ fontSize: '1.2rem', letterSpacing: '0.1em', fontWeight: '900', opacity: 0.8 }}>UPLINK_ESTABLISHED</h2>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.2 }}></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                        <div className="card-industrial" style={{ padding: '30px', textAlign: 'center' }}>
                            <div className="monospaced" style={{ fontSize: '10px', color: 'var(--accent-purple)', marginBottom: '15px' }}>DIRECT_COMMS</div>
                            <h4 className="caps" style={{ marginBottom: '10px' }}>Email Support</h4>
                            <p className="monospaced" style={{ fontSize: '0.8rem', opacity: 0.6 }}>support@anveshan.pro</p>
                        </div>
                        <div className="card-industrial" style={{ padding: '30px', textAlign: 'center' }}>
                            <div className="monospaced" style={{ fontSize: '10px', color: 'var(--accent-purple)', marginBottom: '15px' }}>SOCIAL_NODES</div>
                            <h4 className="caps" style={{ marginBottom: '10px' }}>Public Intel</h4>
                            <p className="monospaced" style={{ fontSize: '0.8rem', opacity: 0.6 }}>@anveshan_2026</p>
                        </div>
                        <div className="card-industrial" style={{ padding: '30px', textAlign: 'center' }}>
                            <div className="monospaced" style={{ fontSize: '10px', color: 'var(--accent-purple)', marginBottom: '15px' }}>ENCRYPTED_LINE</div>
                            <h4 className="caps" style={{ marginBottom: '10px' }}>Signal Protocol</h4>
                            <p className="monospaced" style={{ fontSize: '0.8rem', opacity: 0.6 }}>+91 [REDACTED]</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* FOOTER METADATA */}
            <div ref={footerRef} className="monospaced" style={{
                zIndex: 10,
                opacity: 0.5,
                fontSize: '10px',
                padding: '40px',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(0,0,0,0.2)'
            }}>
                <div>ANVESHAN_CORE_v2.0.6</div>
                <div>© 2026 TECHNICAL_HUB_NETWORK. ALL RIGHTS RESERVED.</div>
                <div>BUILD_ID: #4F2G9</div>
            </div>
        </div>
    );
};

export default LandingPage;
