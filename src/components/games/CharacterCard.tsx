import React from 'react';

interface CharacterCardProps {
    name: string;
    position: 'left' | 'right';
    isAI: boolean;
    isSpeaking: boolean;
    avatar: string;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
    name,
    position,
    isAI,
    isSpeaking,
    avatar
}) => {
    const bgGradient = isAI
        ? 'linear-gradient(135deg, var(--pastel-blue), var(--pastel-purple))'
        : 'linear-gradient(135deg, var(--pastel-pink), var(--pastel-orange))';

    return (
        <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            background: bgGradient,
            boxShadow: isSpeaking ? '0 0 40px rgba(59, 130, 246, 0.6)' : '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'box-shadow 0.3s ease',
            minWidth: '200px',
        }}
            className={isSpeaking ? 'animate-character-glow' : ''}
        >
            {/* Avatar */}
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
                {avatar}
            </div>

            {/* Name Label */}
            <div style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: 'var(--color-text-main)',
                textAlign: 'center',
            }}>
                {name}
            </div>

            {/* Speaking Indicator */}
            {isSpeaking && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    boxShadow: '0 0 10px var(--color-primary)',
                }}
                    className="animate-mic-pulse"
                />
            )}
        </div>
    );
};

export default CharacterCard;
