import React from 'react';
import { Gift as GiftIcon } from 'lucide-react';

interface ChoiceButtonsProps {
    onReceive: () => void;
    onGive: () => void;
    disabled: boolean;
}

const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({ onReceive, onGive, disabled }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
        }}>
            <button
                onClick={onReceive}
                disabled={disabled}
                style={{
                    padding: '20px 40px',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: 'white',
                    background: 'var(--color-primary)',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                }}
                onMouseEnter={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(14, 165, 233, 0.4)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(14, 165, 233, 0.3)';
                    }
                }}
            >
                <GiftIcon size={28} />
                Receive a Gift
            </button>

            <button
                onClick={onGive}
                disabled={disabled}
                style={{
                    padding: '20px 40px',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: 'var(--color-primary)',
                    background: 'white',
                    border: '2px solid var(--color-primary)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    boxShadow: '0 4px 12px rgba(186, 230, 253, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                }}
                onMouseEnter={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(186, 230, 253, 0.5)';
                        e.currentTarget.style.background = '#f0f9ff';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(186, 230, 253, 0.3)';
                        e.currentTarget.style.background = 'white';
                    }
                }}
            >
                <GiftIcon size={28} />
                Give a Gift
            </button>
        </div>
    );
};

export default ChoiceButtons;
