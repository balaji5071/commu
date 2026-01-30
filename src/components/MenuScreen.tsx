import React from 'react';
import Link from 'next/link';
import { MessageCircle, Gift, Mic, BookOpen } from 'lucide-react';

const MenuScreen: React.FC = () => {
    const games = [
        {
            id: 'wrongName',
            title: 'Shout a Wrong Name',
            desc: 'Spell any word except the one shown! Test your quick thinking and vocabulary.',
            icon: MessageCircle,
            href: '/games/wrong-name'
        },
        {
            id: 'gift',
            title: 'Gift Giving Game',
            desc: 'Practice giving and receiving gifts with your AI friend. Build social confidence!',
            icon: Gift,
            href: '/games/gift'
        },
        {
            id: 'spelling',
            title: 'Spelling Conversation',
            desc: 'Listen and repeat letter sequences. Sharpen your listening skills!',
            icon: BookOpen,
            href: '/games/spelling'
        },
        {
            id: 'sales',
            title: 'Sell a Slinky',
            desc: 'Pitch a random product in 60 seconds. Master the art of persuasion!',
            icon: Mic,
            href: '/games/sales'
        }
    ];

    return (
        <div className="menu-wrapper">
            {/* Hero Glow */}
            <div style={{
                position: 'absolute',
                top: '5%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '120%',
                height: '400px',
                background: 'radial-gradient(50% 50% at 50% 50%, rgba(14, 165, 233, 0.15) 0%, rgba(255, 255, 255, 0) 100%)',
                pointerEvents: 'none',
                zIndex: -1
            }} />

            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 4px 12px rgba(186, 230, 253, 0.4)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-primary-dark)',
                border: '1px solid rgba(255,255,255,0.8)',
                margin: '0 auto 24px'
            }}>
                <span style={{
                    position: 'relative',
                    display: 'flex',
                    height: '8px',
                    width: '8px'
                }}>
                    <span style={{
                        position: 'absolute',
                        display: 'inline-flex',
                        height: '100%',
                        width: '100%',
                        borderRadius: '9999px',
                        background: 'var(--color-primary)',
                        opacity: 0.75,
                        animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
                    }}></span>
                    <span style={{
                        position: 'relative',
                        display: 'inline-flex',
                        borderRadius: '9999px',
                        height: '8px',
                        width: '8px',
                        background: 'var(--color-primary)'
                    }}></span>
                </span>
                Speaking Gym ✨
            </div>

            <h1 className="menu-title">
                <span style={{
                    background: 'linear-gradient(135deg, var(--color-primary), #0ea5e9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>Mastering</span>
                <br />
                Spontaneous
                <br />
                <span style={{
                    background: 'linear-gradient(135deg, #38bdf8, var(--color-primary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>Communication</span>
            </h1>
            <p className="menu-description">
                A playful, modern speaking gym that builds confidence through improvisation.
            </p>
            <p className="menu-description" style={{ marginBottom: '34px' }}>
                Choose a game and start practicing!
            </p>

            <div className="menu-grid">
                {games.map((game, idx) => (
                    <Link
                        key={game.id}
                        href={game.href}
                        style={{
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                    >
                        <div className="game-card">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                background: 'var(--color-primary)', // Solid sky blue
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)'
                            }}>
                                <game.icon size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--color-text-main)' }}>
                                {game.title}
                            </h3>
                            <p style={{ color: 'var(--color-text-sub)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                {game.desc}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default MenuScreen;
