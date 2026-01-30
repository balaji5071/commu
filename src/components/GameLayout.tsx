import React from 'react';
import { ArrowLeft, Timer } from 'lucide-react';

interface GameLayoutProps {
    children: React.ReactNode;
    onBack: () => void;
    timer?: number;
    score?: number | null;
    title?: string;
}

const GameLayout: React.FC<GameLayoutProps> = ({ children, onBack, timer, score, title }) => {
    return (
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '800px',
                height: 'auto',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                paddingBottom: '100px', // Space for fixed mic indicator
                position: 'relative'
            }} className="animate-fade-in">

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px'
                }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'rgba(255,255,255,0.6)',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            color: 'var(--color-text-sub)'
                        }}
                        className="hover:bg-white transition-colors"
                    >
                        <ArrowLeft size={20} /> Menu
                    </button>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        {timer !== undefined && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '1.2rem', color: 'var(--color-text-main)' }}>
                                <Timer size={24} /> {timer}s
                            </div>
                        )}
                        {score !== null && score !== undefined && (
                            <div style={{
                                background: 'var(--color-primary)',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                fontWeight: '700'
                            }}>
                                Score: {score}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="glass-panel" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '30px',
                    position: 'relative',
                    background: 'rgba(255,255,255,0.4)', // lighter glass for inner container
                    border: 'none',
                    boxShadow: 'none'
                }}>
                    {children}
                </div>

            </div>
        </div>
    );
};

export default GameLayout;
