import React from 'react';
import { Gift } from '@/utils/giftUtils';

interface GiftRevealProps {
    gift: Gift;
    text: string;
    isTyping?: boolean;
}

const GiftReveal: React.FC<GiftRevealProps> = ({ gift, text, isTyping = false }) => {
    return (
        <div
            className="animate-gift-reveal"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                padding: '30px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                textAlign: 'center',
            }}
        >
            {/* Gift Emoji or Image */}
            <div style={{
                animation: 'bounceIn 0.8s ease-out',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '10px'
            }}>
                {gift.image ? (
                    <img
                        src={gift.image}
                        alt={gift.name}
                        style={{
                            maxWidth: '200px',
                            maxHeight: '150px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            objectFit: 'contain'
                        }}
                    />
                ) : (
                    <div style={{ fontSize: '4rem' }}>
                        {gift.emoji}
                    </div>
                )}
            </div>

            {/* Gift Name */}
            <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--color-primary)',
            }}>
                {gift.name}
            </div>

            {/* Message Text */}
            <div style={{
                fontSize: '1.1rem',
                color: 'var(--color-text-main)',
                maxWidth: '400px',
                lineHeight: '1.6',
            }}>
                {text}
                {isTyping && (
                    <span
                        className="animate-typing"
                        style={{
                            display: 'inline-block',
                            marginLeft: '4px',
                        }}
                    >
                        ...
                    </span>
                )}
            </div>
        </div>
    );
};

export default GiftReveal;
