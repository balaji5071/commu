import React from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface MicIndicatorProps {
    isListening: boolean;
    error: string | null;
    onToggle?: () => void;
}

const MicIndicator: React.FC<MicIndicatorProps> = ({ isListening, error, onToggle }) => {
    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Main mic indicator */}
            <div
                onClick={onToggle}
                className={isListening ? 'animate-mic-pulse' : ''}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: error ? 'var(--color-danger)' : isListening ? 'var(--color-primary)' : '#e2e8f0',
                    color: error || isListening ? 'white' : '#94a3b8',
                    transition: 'all 0.3s',
                    zIndex: 1000,
                    boxShadow: isListening ? '0 0 30px rgba(59, 130, 246, 0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
                    cursor: onToggle ? 'pointer' : 'default',
                }}
                onMouseEnter={(e) => {
                    if (onToggle) {
                        e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (onToggle) {
                        e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
                    }
                }}
            >
                {error ? (
                    <AlertCircle size={32} />
                ) : isListening ? (
                    <Mic size={32} />
                ) : (
                    <MicOff size={32} />
                )}
            </div>
        </div>
    );
};

export default MicIndicator;
