import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '../GameLayout';
import MicIndicator from '../ui/MicIndicator';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface WrongNameProps {
    onBack: () => void;
}

import { ITEMS } from '@/data/gameItems';

const WrongName: React.FC<WrongNameProps> = ({ onBack }) => {
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(60);
    const [currentItem, setCurrentItem] = useState(ITEMS[0]);
    const [feedback, setFeedback] = useState<'neutral' | 'success' | 'error'>('neutral');
    const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');

    const nextItem = useCallback(() => {
        const random = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        setCurrentItem(random);
    }, []);

    const handleResult = useCallback((final: string) => {
        if (!final) return;
        const spoken = final.toLowerCase();
        const forbidden = currentItem.name.toLowerCase();

        if (spoken.includes(forbidden)) {
            setFeedback('error');
            setTimeout(() => setFeedback('neutral'), 500);
        } else {
            setScore(s => s + 1);
            setFeedback('success');
            setTimeout(() => {
                setFeedback('neutral');
                nextItem();
            }, 500);
        }
    }, [currentItem, nextItem]);

    const { isListening, error, start, stop } = useSpeechRecognition({
        onResult: handleResult,
        continuous: true
    });

    // Timer Logic
    useEffect(() => {
        if (timer > 0 && gameState === 'playing') {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else if (timer === 0) {
            setGameState('finished');
            stop();
        }
    }, [timer, gameState, stop]);

    // Initial Start
    useEffect(() => {
        start();
        return () => stop();
    }, [start, stop]);

    if (gameState === 'finished') {
        return (
            <GameLayout onBack={onBack} title="Game Over">
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Time's Up!</h2>
                    <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Final Score: {score}</p>
                    <button className="btn-primary" onClick={onBack}>Back to Menu</button>
                </div>
            </GameLayout>
        );
    }

    return (
        <GameLayout onBack={onBack} timer={timer} score={score}>
            <div className="flex flex-col items-center justify-center flex-1 h-full text-center">

                <div style={{
                    fontSize: '6rem',
                    marginBottom: '20px',
                    color: feedback === 'error' ? 'var(--color-danger)' : feedback === 'success' ? 'var(--color-success)' : 'inherit',
                    transition: 'color 0.2s'
                }}>
                    {currentItem.icon}
                </div>

                <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-sub)', marginBottom: '40px' }}>
                    Don't say "{currentItem.name}"!
                </h2>

                {/* Mic Indicator - Now Fixed at Bottom */}
                <MicIndicator
                    isListening={isListening}
                    error={error}
                    onToggle={() => isListening ? stop() : start()}
                />

            </div>
        </GameLayout>
    );
};

export default WrongName;
