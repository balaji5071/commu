'use client';

import React, { useState, useEffect, useRef } from 'react';
import GameLayout from '../GameLayout';
import CharacterCard from './CharacterCard';
import ChoiceButtons from './ChoiceButtons';
import GiftReveal from './GiftReveal';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import {
    Gift,
    getRandomGift,
    extractKeywords,
    generateAIResponse,
    getEncouragingMessage
} from '@/utils/giftUtils';

interface GiftGameProps {
    onBack: () => void;
}

type GameMode = 'choosing' | 'receiving' | 'giving' | 'complete';
type ConversationStage = 'gift-reveal' | 'user-reaction' | 'ai-justification' | 'user-gift' | 'ai-reaction' | 'user-explanation' | 'ai-reflection';

interface Message {
    id: number;
    text: string;
    sender: 'ai' | 'user';
    gift?: Gift;
}

const GiftGame: React.FC<GiftGameProps> = ({ onBack }) => {
    const [gameMode, setGameMode] = useState<GameMode>('choosing');
    const [stage, setStage] = useState<ConversationStage>('gift-reveal');
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentGift, setCurrentGift] = useState<Gift | null>(null);
    const [userGift, setUserGift] = useState<string>('');
    const [currentTranscript, setCurrentTranscript] = useState<string>('');
    const [interimTranscript, setInterimTranscript] = useState<string>('');
    const [currentSpeaker, setCurrentSpeaker] = useState<'ai' | 'user' | null>(null);
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [awaitingUserStart, setAwaitingUserStart] = useState(false);
    const [textInput, setTextInput] = useState('');

    const scrollRef = useRef<HTMLDivElement>(null);
    const lastUserInputRef = useRef<string>('');
    const speechRef = useRef<SpeechSynthesis | null>(null);

    // Auto-scroll messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, currentTranscript, interimTranscript]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            speechRef.current = window.speechSynthesis;
        }
    }, []);

    const addMessage = (text: string, sender: 'ai' | 'user', gift?: Gift) => {
        setMessages(prev => [...prev, { id: Date.now(), text, sender, gift }]);
    };

    const speakText = (text: string) => {
        if (!speechRef.current) return;
        speechRef.current.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.95;
        speechRef.current.speak(utter);
    };

    const speakTextAsync = (text: string) => {
        return new Promise<void>((resolve) => {
            if (!speechRef.current) {
                resolve();
                return;
            }
            speechRef.current.cancel();
            const utter = new SpeechSynthesisUtterance(text);
            utter.rate = 0.95;
            utter.onend = () => resolve();
            utter.onerror = () => resolve();
            speechRef.current.speak(utter);
        });
    };

    // Speech recognition
    const { isListening, error, start, stop } = useSpeechRecognition({
        onResult: (final, interim) => {
            setInterimTranscript(interim);

            if (final) {
                setCurrentTranscript('');
                setInterimTranscript('');
                handleSpeechInput(final);
            } else {
                setCurrentTranscript(interim);
            }
        },
        continuous: false
    });

    useEffect(() => {
        if (currentSpeaker === 'user' && !isListening) {
            start();
        }
    }, [currentSpeaker, isListening, start]);

    const handleSpeechInput = (transcript: string) => {
        if (!transcript.trim()) return;

        lastUserInputRef.current = transcript;

        // Flow 1: User receives gift and reacts
        if (gameMode === 'receiving' && stage === 'user-reaction') {
            addMessage(transcript, 'user');
            setCurrentSpeaker(null);
            stop();

            // AI justifies the gift
            setIsAIThinking(true);
            setTimeout(() => {
                setCurrentSpeaker('ai');
                const keywords = extractKeywords(transcript);
                const response = generateAIResponse({
                    gift: currentGift!,
                    keywords,
                    flow: 'receiving',  
                    stage: 'justification'
                });
                addMessage(response, 'ai');
                setIsAIThinking(false);

                speakTextAsync(response).then(() => {
                    setCurrentSpeaker(null);
                    setGameMode('complete');
                });
            }, 1500);
        }

        // Flow 2: User gives a gift (naming stage)
        if (gameMode === 'giving' && stage === 'user-gift') {
            setUserGift(transcript);
            addMessage(`I'm giving you ${transcript}!`, 'user');
            setCurrentSpeaker(null);
            stop();

            // AI reacts with surprise/gratitude
            setIsAIThinking(true);
            setTimeout(() => {
                setCurrentSpeaker('ai');
                const response = generateAIResponse({
                    gift: { name: transcript, emoji: '🎁' },
                    keywords: [],
                    flow: 'giving',
                    stage: 'reaction'
                });
                addMessage(response, 'ai');
                setIsAIThinking(false);

                speakTextAsync(response).then(() => {
                    const prompt = "Tell me, why did you choose this gift for me?";
                    addMessage(prompt, 'ai');
                    speakTextAsync(prompt).then(() => {
                        setStage('user-explanation');
                        setCurrentSpeaker('user');
                    });
                });
            }, 1500);
        }

        // Flow 2: User explains their gift choice
        if (gameMode === 'giving' && stage === 'user-explanation') {
            addMessage(transcript, 'user');
            setCurrentSpeaker(null);
            stop();

            // AI reflects on the explanation
            setIsAIThinking(true);
            setTimeout(() => {
                setCurrentSpeaker('ai');
                const keywords = extractKeywords(transcript);
                const response = generateAIResponse({
                    gift: { name: userGift, emoji: '🎁' },
                    keywords,
                    flow: 'giving',
                    stage: 'reflection'
                });
                addMessage(response, 'ai');
                setIsAIThinking(false);

                speakTextAsync(response).then(() => {
                    setCurrentSpeaker(null);
                    setGameMode('complete');
                });
            }, 1500);
        }
    };

    const handleReceiveGift = () => {
        setGameMode('receiving');
        setStage('gift-reveal');
        setMessages([]);
        setCurrentSpeaker('ai');

        // AI gives gift
        const gift = getRandomGift();
        setCurrentGift(gift);

        setTimeout(() => {
            addMessage("I have something special for you...", 'ai', gift);
            speakTextAsync("I have something special for you.").then(() => {
                // Wait for gift animation, then ask for user reaction
                setTimeout(() => {
                    setStage('user-reaction');
                    setCurrentSpeaker('user');
                    speakText(`The gift is ${gift.name}.`);
                }, 2000);
            });
        }, 500);
    };

    const handleGiveGift = () => {
        setGameMode('giving');
        setStage('user-gift');
        setMessages([]);
        setCurrentSpeaker('user');

        const prompt = "What gift would you like to give me?";
        addMessage("What gift would you like to give me? 🎁", 'ai');
        speakText(prompt);

        setTimeout(() => {
            // auto-start mic on user turn
        }, 500);
    };

    const handlePlayAgain = () => {
        setGameMode('choosing');
        setStage('gift-reveal');
        setMessages([]);
        setCurrentGift(null);
        setUserGift('');
        setCurrentTranscript('');
        setInterimTranscript('');
        setCurrentSpeaker(null);
        setAwaitingUserStart(false);
        stop();
    };

    const handleStartSpeaking = () => {
        if (currentSpeaker !== 'user') return;
        setAwaitingUserStart(false);
        start();
    };

    const handleTextSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (currentSpeaker !== 'user') return;
        const trimmed = textInput.trim();
        if (!trimmed) return;
        if (isListening) {
            stop();
        }
        setAwaitingUserStart(false);
        setTextInput('');
        handleSpeechInput(trimmed);
    };

    return (
        <GameLayout onBack={onBack} title="Gift Game">
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                gap: '20px',
            }}>
                {/* Character Cards - Split Screen */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                }}>
                    <CharacterCard
                        name="AI Friend"
                        position="left"
                        isAI={true}
                        isSpeaking={currentSpeaker === 'ai'}
                        avatar="🤖"
                    />
                    <CharacterCard
                        name="You"
                        position="right"
                        isAI={false}
                        isSpeaking={currentSpeaker === 'user'}
                        avatar="😊"
                    />
                </div>

                {/* Main Content Area */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    overflowY: 'auto',
                }}
                    ref={scrollRef}
                >
                    {/* Choice Screen */}
                    {gameMode === 'choosing' && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '30px',
                            padding: '40px 20px',
                        }}
                            className="animate-fade-in"
                        >
                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: 'var(--color-text-main)',
                                textAlign: 'center',
                            }}>
                                Choose Your Adventure! 🎁
                            </h2>
                            <ChoiceButtons
                                onReceive={handleReceiveGift}
                                onGive={handleGiveGift}
                                disabled={false}
                            />
                        </div>
                    )}

                    {/* Conversation Area */}
                    {(gameMode === 'receiving' || gameMode === 'giving') && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                        }}>
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    style={{
                                        alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
                                        maxWidth: '80%',
                                    }}
                                    className="animate-slide-up"
                                >
                                    {msg.gift ? (
                                        <GiftReveal
                                            gift={msg.gift}
                                            text={msg.text}
                                        />
                                    ) : (
                                        <div style={{
                                            padding: '16px 20px',
                                            borderRadius: '18px',
                                            background: msg.sender === 'ai'
                                                ? 'linear-gradient(135deg, var(--pastel-blue), var(--pastel-purple))'
                                                : 'linear-gradient(135deg, var(--pastel-pink), var(--pastel-orange))',
                                            color: 'var(--color-text-main)',
                                            fontSize: '1.1rem',
                                            lineHeight: '1.6',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        }}>
                                            {msg.text}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Live Transcription */}
                            {(currentTranscript || interimTranscript) && (
                                <div style={{
                                    alignSelf: 'flex-end',
                                    maxWidth: '80%',
                                    padding: '16px 20px',
                                    borderRadius: '18px',
                                    background: 'linear-gradient(135deg, rgba(255,182,193,0.3), rgba(255,218,185,0.3))',
                                    border: '2px dashed var(--color-accent)',
                                    color: 'var(--color-text-sub)',
                                    fontSize: '1.1rem',
                                    fontStyle: 'italic',
                                }}>
                                    {currentTranscript || interimTranscript}
                                    <span className="animate-typing">...</span>
                                </div>
                            )}

                            {/* AI Thinking Indicator */}
                            {isAIThinking && (
                                <div style={{
                                    alignSelf: 'flex-start',
                                    padding: '16px 20px',
                                    borderRadius: '18px',
                                    background: 'linear-gradient(135deg, var(--pastel-blue), var(--pastel-purple))',
                                    color: 'var(--color-text-main)',
                                }}>
                                    <span className="animate-typing">Thinking</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Completion Screen */}
                    {gameMode === 'complete' && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '30px',
                            padding: '40px 20px',
                        }}
                            className="animate-fade-in"
                        >
                            <div style={{
                                fontSize: '4rem',
                            }}>
                                ✨
                            </div>
                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: 'var(--color-primary)',
                                textAlign: 'center',
                            }}>
                                {getEncouragingMessage()}
                            </h2>

                            <button
                                onClick={handlePlayAgain}
                                style={{
                                    padding: '16px 40px',
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    color: 'white',
                                    background: 'var(--color-primary)',
                                    border: 'none',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                    transition: 'all 0.3s ease',
                                }}
                                className="btn-primary"
                            >
                                Play Again
                            </button>
                        </div>
                    )}
                </div>

                {/* Microphone Status */}
                {currentSpeaker === 'user' && (
                    <form
                        onSubmit={handleTextSubmit}
                        style={{
                            position: 'fixed',
                            bottom: '90px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '10px',
                            padding: '10px 12px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '999px',
                            border: '1px solid var(--glass-border)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                            zIndex: 1000,
                            width: 'min(720px, 90vw)'
                        }}
                    >
                        <input
                            type="text"
                            value={textInput}
                            onChange={(event) => setTextInput(event.target.value)}
                            placeholder="Type your response..."
                            style={{
                                flex: 1,
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: '1rem',
                                padding: '8px 12px',
                                color: 'var(--color-text-main)'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                border: 'none',
                                background: 'var(--color-primary)',
                                color: 'white',
                                padding: '10px 18px',
                                borderRadius: '999px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Send
                        </button>
                    </form>
                )}

                {currentSpeaker === 'user' && (
                    <div style={{
                        position: 'fixed',
                        bottom: '30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '12px 24px',
                        background: isListening ? 'var(--color-primary)' : 'var(--color-danger)',
                        color: 'white',
                        borderRadius: '50px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                        cursor: isListening ? 'default' : 'pointer'
                    }}
                        className={isListening ? 'animate-mic-pulse' : ''}
                        onClick={isListening ? undefined : handleStartSpeaking}
                    >
                        {error ? `Error: ${error}` : isListening ? '🎤 Listening...' : awaitingUserStart ? '🎤 Tap to start speaking' : '🎤 Click to speak'}
                    </div>
                )}
            </div>
        </GameLayout>
    );
};

export default GiftGame;
