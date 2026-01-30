import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '../GameLayout';
import MicIndicator from '../ui/MicIndicator';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface SalesGameProps {
    onBack: () => void;
}

const PRODUCTS = [
    { name: "A Leaf", image: "/assets/leaf.png" },
    { name: "Stones", image: "/assets/stones.png" },
    { name: "A Book", image: "/assets/book.png" },
    { name: "ink-pen", image: "/assets/ink-pen.png" },
    { name: "Vintage car", image: "/assets/vintage-car.png" },
    { name: "A Door", image: "/assets/door.png" },
    { name: "A Chair", image: "/assets/chair.png" },
    { name: "A Remote", image: "/assets/remote.png" },
    { name: "Mac Laptop", image: "/assets/mac-laptop.png" },
    { name: "Luxury Villa", image: "/assets/villa.png" }
];

interface Product {
    name: string;
    image: string;
}

interface Evaluation {
    grammarScore: number;
    strategyScore: number;
    overallScore: number;
    feedback: {
        strengths: string;
        improvements: string;
        summary: string;
    };
}

const SalesGame: React.FC<SalesGameProps> = ({ onBack }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [timer, setTimer] = useState(60);
    const [gameState, setGameState] = useState<'playing' | 'evaluating' | 'results'>('playing');
    const [transcript, setTranscript] = useState("");
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

    // Initialize with random product(s)
    useEffect(() => {
        selectRandomProducts();
    }, []);

    const selectRandomProducts = () => {
        // 30% chance of combo (2-3 products)
        const isCombo = Math.random() < 0.3;

        if (isCombo) {
            const count = Math.random() < 0.5 ? 2 : 3;
            const shuffled = [...PRODUCTS].sort(() => Math.random() - 0.5);
            setProducts(shuffled.slice(0, count));
        } else {
            const randomProduct = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
            setProducts([randomProduct]);
        }
    };

    const { isListening, error, start, stop } = useSpeechRecognition({
        onResult: (final) => {
            setTranscript(prev => {
                const newText = prev + " " + final;
                return newText.trim();
            });
        },
        continuous: true
    });

    const handleFinish = useCallback(async () => {
        stop();

        // Guard: avoid API call for empty / very short speech
        if (!transcript || transcript.trim().length < 20) {
            setEvaluation({
                grammarScore: 0,
                strategyScore: 0,
                overallScore: 0,
                feedback: {
                    strengths: "You're willing to practice — that already puts you ahead.",
                    improvements: "Speak a little longer and explain why someone should care about the product.",
                    summary: "Try again and aim for at least 20–30 seconds of clear speech."
                }
            });
            setGameState("results");
            return;
        }

        setGameState("evaluating");

        try {
            const productName = products.map(p => p.name).join(" + ");

            const response = await fetch("/api/evaluate-pitch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transcript: transcript.trim(),
                    productName
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.details || "Evaluation failed");
            }

            const result = await response.json();
            setEvaluation(result);
            setGameState("results");

        } catch (error) {
            console.error("Evaluation error:", error);

            // Safe fallback (NO restart loop, NO alert spam)
            setEvaluation({
                grammarScore: 0,
                strategyScore: 0,
                overallScore: 0,
                feedback: {
                    strengths: "You completed the pitch attempt.",
                    improvements: "A technical issue prevented evaluation.",
                    summary: "Please try again in a moment."
                }
            });

            setGameState("results");
        }
    }, [products, stop, transcript]);

    // Timer Logic
    useEffect(() => {
        if (timer > 0 && gameState === 'playing') {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else if (timer === 0 && gameState === 'playing') {
            handleFinish();
        }
    }, [gameState, handleFinish, timer]);

    useEffect(() => {
        return () => stop();
    }, [stop]);

    const handleTryAgain = () => {
        setTranscript("");
        setEvaluation(null);
        setTimer(60);
        setGameState('playing');
        selectRandomProducts();
    };

    // Results Screen
    if (gameState === 'results' && evaluation) {
        return (
            <GameLayout onBack={onBack} title="Pitch Evaluation">
                <div className="flex flex-col items-center justify-center h-full text-center p-6" style={{ overflowY: 'auto' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '30px' }}>
                        Your Results
                    </h2>

                    {/* Scores */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px', width: '100%', maxWidth: '600px' }}>
                        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>Grammar</div>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                                {evaluation.grammarScore}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>/ 10</div>
                        </div>

                        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>Strategy</div>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-accent)' }}>
                                {evaluation.strategyScore}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>/ 10</div>
                        </div>

                        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>Overall</div>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-success)' }}>
                                {evaluation.overallScore}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>/ 10</div>
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px', textAlign: 'left', width: '100%', maxWidth: '600px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-success)', marginBottom: '8px' }}>
                                ✓ Strengths
                            </h3>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-main)' }}>
                                {evaluation.feedback.strengths}
                            </p>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-accent)', marginBottom: '8px' }}>
                                ↑ Areas to Improve
                            </h3>
                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-main)' }}>
                                {evaluation.feedback.improvements}
                            </p>
                        </div>

                        <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                            <p style={{ fontSize: '1rem', fontStyle: 'italic', color: 'var(--color-text-sub)' }}>
                                {evaluation.feedback.summary}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-primary" onClick={handleTryAgain}>
                            Try Again
                        </button>
                        <button
                            className="btn-primary"
                            onClick={onBack}
                            style={{ background: 'rgba(100, 116, 139, 0.2)' }}
                        >
                            Back to Menu
                        </button>
                    </div>
                </div>
            </GameLayout>
        );
    }

    // Evaluating Screen
    if (gameState === 'evaluating') {
        return (
            <GameLayout onBack={onBack} title="Evaluating...">
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🤔</div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Analyzing Your Pitch...</h2>
                    <p style={{ color: '#64748b' }}>Our AI is evaluating your performance</p>
                </div>
            </GameLayout>
        );
    }

    // Playing Screen
    const productName = products.map(p => p.name).join(' + ');
    const isCombo = products.length > 1;

    return (
        <GameLayout onBack={onBack} timer={timer} title="Sales Pitch">
            <div className="flex flex-col h-full items-center text-center">

                <div className="mb-6">
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                        {isCombo ? 'SELL THIS COMBO' : 'SELL THIS'}
                    </p>

                    {/* Product Image(s) */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                        margin: '20px auto',
                        flexWrap: 'wrap'
                    }}>
                        {products.map((product, idx) => (
                            <div key={idx} style={{
                                width: isCombo ? '140px' : '200px',
                                height: isCombo ? '140px' : '200px',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                            }}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <h2 style={{ fontSize: isCombo ? '1.8rem' : '2.5rem', fontWeight: '800', margin: '10px 0' }}>
                        {productName}
                    </h2>
                </div>

                {/* Prompts */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', opacity: 0.7, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['Problem', 'Benefit', 'Story', 'Close'].map(step => (
                        <span key={step} style={{
                            background: '#e2e8f0',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem'
                        }}>
                            {step}
                        </span>
                    ))}
                </div>

                {/* Live Transcript / Text Input */}
                <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Start speaking or type your pitch here..."
                    className="glass-panel"
                    style={{
                        width: '100%',
                        flex: 1,
                        padding: '20px',
                        background: 'rgba(255,255,255,0.3)',
                        textAlign: 'left',
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        overflowY: 'auto',
                        marginBottom: '12px',
                        border: '2px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '12px',
                        resize: 'none',
                        fontFamily: 'inherit'
                    }}
                />

                {/* Finish Early Button */}
                {transcript.length > 50 && (
                    <button
                        className="btn-primary"
                        onClick={handleFinish}
                        style={{ marginBottom: '12px', fontSize: '0.9rem', padding: '8px 16px' }}
                    >
                        Finish & Get Score
                    </button>
                )}

                {/* Mic Indicator */}
                <MicIndicator
                    isListening={isListening}
                    error={error}
                    onToggle={() => isListening ? stop() : start()}
                />

            </div>
        </GameLayout>
    );
};

export default SalesGame;
