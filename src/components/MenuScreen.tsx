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
        <div style={{
            width: '90%',
            maxWidth: '920px',
            padding: '20px 20px 40px',
            textAlign: 'center'
        }}>
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 12px rgba(186, 230, 253, 0.4)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                border: '1px solid #e0f2fe',
                margin: '0 auto 20px'
            }}>
                <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '999px',
                    background: 'var(--color-primary)'
                }} />
                Speaking Gym ✨
            </div>

            <h1 style={{
                fontSize: '3.1rem',
                fontWeight: '800',
                lineHeight: 1.1,
                marginBottom: '10px',
                color: 'var(--color-text-main)'
            }}>
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
            <p style={{ color: 'var(--color-text-sub)', marginBottom: '6px', fontSize: '1.05rem' }}>
                A playful, modern speaking gym that builds confidence through improvisation.
            </p>
            <p style={{ color: 'var(--color-text-sub)', marginBottom: '34px', fontSize: '0.98rem' }}>
                Choose a game and start practicing!
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '20px'
            }}>
                {games.map((game, idx) => (
                    <Link
                        key={game.id}
                        href={game.href}
                        style={{
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                    >
                        <div
                            style={{
                                padding: '24px',
                                borderRadius: '24px',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: '2px solid transparent',
                                height: '100%',
                                background: 'white',
                                color: 'var(--color-text-main)',
                                textAlign: 'left',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01)';
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >
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
