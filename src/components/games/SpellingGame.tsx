import React, { useEffect, useMemo, useRef, useState } from 'react';
import GameLayout from '../GameLayout';
import CharacterCard from './CharacterCard';
import MicIndicator from '../ui/MicIndicator';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface SpellingGameProps {
    onBack: () => void;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_ROUNDS = 10;
const TIME_LIMIT_SECONDS = 20;

const COACHING = [
    'Focus on rhythm and grouping letters.',
    'Try chunking the letters into small groups.',
    'Stay steady and repeat one letter at a time.'
];

const WORD_TO_LETTER: Record<string, string> = {
    a: 'A', ay: 'A', hey: 'A',
    b: 'B', bee: 'B', be: 'B',
    c: 'C', see: 'C', sea: 'C',
    d: 'D', dee: 'D',
    e: 'E', ee: 'E',
    f: 'F', ef: 'F',
    g: 'G', gee: 'G',
    h: 'H', aitch: 'H',
    i: 'I', eye: 'I',
    j: 'J', jay: 'J',
    k: 'K', kay: 'K',
    l: 'L', el: 'L',
    m: 'M', em: 'M',
    n: 'N', en: 'N',
    o: 'O', oh: 'O',
    p: 'P', pee: 'P',
    q: 'Q', cue: 'Q', queue: 'Q',
    r: 'R', are: 'R',
    s: 'S', ess: 'S',
    t: 'T', tee: 'T',
    u: 'U', you: 'U',
    v: 'V', vee: 'V',
    w: 'W', doubleyou: 'W', double: 'W',
    x: 'X', ex: 'X',
    y: 'Y', why: 'Y',
    z: 'Z', zee: 'Z', zed: 'Z'
};

const SpellingGame: React.FC<SpellingGameProps> = ({ onBack }) => {
    const [gameStarted, setGameStarted] = useState(false);
    const [round, setRound] = useState(0);
    const [sequence, setSequence] = useState<string[]>([]);
    const [showSequence] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [textInput, setTextInput] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [coach, setCoach] = useState<string | null>(null);
    const [phase, setPhase] = useState<'idle' | 'ai-speaking' | 'user-speaking' | 'evaluating'>('idle');
    const [awaitingUserStart, setAwaitingUserStart] = useState(false);
    const [success, setSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
    const [gameEnded, setGameEnded] = useState(false);

    const finalTranscriptRef = useRef('');
    const speechRef = useRef<SpeechSynthesis | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const targetLength = useMemo(() => Math.min(3 + Math.floor(round / 2), 20), [round]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            speechRef.current = window.speechSynthesis;
        }
    }, []);

    const generateSequence = (length: number) => {
        const next = Array.from({ length }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]);
        setSequence(next);
        return next;
    };

    const speakSequence = async (letters: string[]) => {
        if (!speechRef.current) return;
        speechRef.current.cancel();
        for (const letter of letters) {
            await new Promise<void>((resolve) => {
                const utter = new SpeechSynthesisUtterance(letter);
                utter.rate = 0.9;
                utter.onend = () => resolve();
                speechRef.current?.speak(utter);
            });
            await new Promise(res => setTimeout(res, 250));
        }
    };

    const startRound = async (nextRound = round) => {
        if (nextRound >= MAX_ROUNDS) {
            setGameEnded(true);
            setPhase('idle');
            setAwaitingUserStart(false);
            stop();
            return;
        }
        setPhase('ai-speaking');
        setFeedback(null);
        setCoach(null);
        setSuccess(false);
        setTranscript('');
        setTextInput('');
        finalTranscriptRef.current = '';
        setAwaitingUserStart(false);
        setTimeLeft(TIME_LIMIT_SECONDS);
        const length = Math.min(3 + Math.floor(nextRound / 2), 20);
        const next = generateSequence(length);
        await speakSequence(next);
        setPhase('user-speaking');
        setAwaitingUserStart(true);
    };

    const { isListening, error, start, stop } = useSpeechRecognition({
        onResult: (final, interim) => {
            const raw = `${final} ${interim}`.trim();
            const letters = normalizeToLetters(raw);
            setTranscript(letters.join(' '));
            if (final) {
                finalTranscriptRef.current = `${finalTranscriptRef.current} ${final}`.trim();
            }
            if (letters.length >= sequence.length && phase === 'user-speaking') {
                setTimeout(() => evaluateAnswer(finalTranscriptRef.current), 300);
            }
        },
        continuous: false
    });

    useEffect(() => {
        return () => stop();
    }, []);

    useEffect(() => {
        if (!gameStarted) return;
        if (phase === 'user-speaking' && !isListening) {
            setAwaitingUserStart(false);
            start();
        }
    }, [gameStarted, phase, isListening, start]);

    useEffect(() => {
        if (phase === 'ai-speaking' && isListening) {
            stop();
        }
    }, [phase, isListening, stop]);

    useEffect(() => {
        if (phase !== 'user-speaking' || gameEnded) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    evaluateAnswer(finalTranscriptRef.current || transcript);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [phase, gameEnded]);

    const normalizeToLetters = (raw: string) => {
        const cleaned = raw.toLowerCase().replace(/[^a-z\s]/g, ' ');
        const tokens = cleaned.split(/\s+/).filter(Boolean);
        const letters: string[] = [];
        tokens.forEach((token) => {
            if (token.length === 1 && token >= 'a' && token <= 'z') {
                letters.push(token.toUpperCase());
                return;
            }
            if (WORD_TO_LETTER[token]) {
                letters.push(WORD_TO_LETTER[token]);
                return;
            }
            // If a token is multiple letters (like "ABC"), split it
            if (/^[a-z]+$/.test(token) && token.length <= 5) {
                token.split('').forEach(ch => letters.push(ch.toUpperCase()));
            }
        });
        return letters;
    };

    const evaluateAnswer = (finalText: string) => {
        if (phase !== 'user-speaking') return;
        setPhase('evaluating');
        setAwaitingUserStart(false);
        stop();

        const userLetters = normalizeToLetters(finalText);
        const expected = sequence;

        const feedbackText = compareSequences(expected, userLetters);
        const correct = feedbackText === 'Perfect repetition!';

        setFeedback(feedbackText);
        setSuccess(correct);
        setCoach(correct ? null : COACHING[Math.floor(Math.random() * COACHING.length)]);

        setTimeout(() => {
            setRound(prev => prev + 1);
            startRound(round + 1);
        }, 2200);
    };

    const compareSequences = (expected: string[], actual: string[]) => {
        if (expected.length === 0) return 'Perfect repetition!';
        const minLen = Math.min(expected.length, actual.length);
        for (let i = 0; i < minLen; i++) {
            if (expected[i] !== actual[i]) {
                return `Order mistake at position ${i + 1}: you said ${actual[i]} instead of ${expected[i]}.`;
            }
        }
        if (actual.length < expected.length) {
            return `You missed the letter ${expected[actual.length]}.`;
        }
        if (actual.length > expected.length) {
            return `You said an extra letter ${actual[expected.length]}.`;
        }
        return 'Perfect repetition!';
    };

    const requestMicPermission = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return true;
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            return true;
        } catch {
            return false;
        }
    };

    const handleMicToggle = async () => {
        console.log('🎤 Mic toggle clicked', phase, isListening);
        if (!gameStarted) return;
        if (isListening) {
            evaluateAnswer(finalTranscriptRef.current || transcript);
        } else {
            setAwaitingUserStart(false);
            const ok = await requestMicPermission();
            if (ok) {
                start();
            }
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (phase !== 'user-speaking' || !textInput.trim()) return;
        finalTranscriptRef.current = textInput.trim();
        setTranscript(normalizeToLetters(textInput).join(' '));
        evaluateAnswer(textInput);
    };

    return (
        <GameLayout onBack={onBack} title="Spelling Conversation">
            <div className="flex flex-col h-full items-center">

                {!gameStarted && (
                    <button
                        onClick={() => {
                            setGameStarted(true);
                            setGameEnded(false);
                            setRound(0);
                            startRound();
                        }}
                        style={{
                            padding: '12px 28px',
                            borderRadius: '999px',
                            border: 'none',
                            fontWeight: 700,
                            background: 'var(--color-primary)',
                            color: 'white',
                            boxShadow: '0 6px 18px rgba(59, 130, 246, 0.35)',
                            cursor: 'pointer',
                            marginBottom: '18px'
                        }}
                    >
                        Start Game
                    </button>
                )}

                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>INSTRUCTION</p>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                        Listen carefully and repeat the letters.
                    </h2>
                </div>

                <div style={{ marginBottom: '18px' }}>
                    <CharacterCard
                        name="AI Friend"
                        position="left"
                        isAI={true}
                        isSpeaking={phase === 'ai-speaking'}
                        avatar="🤖"
                    />
                </div>

                <div style={{
                    marginBottom: '18px',
                    padding: '12px 18px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.12))',
                    fontWeight: 700,
                    color: 'var(--color-text-main)'
                }}>
                    Round {Math.min(round + 1, MAX_ROUNDS)} / {MAX_ROUNDS} • {sequence.length} letters • {timeLeft}s
                </div>

                <div style={{
                    flex: 1,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '14px'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        fontFamily: 'monospace',
                        color: 'var(--color-text-main)',
                        minHeight: '40px'
                    }}>
                        {transcript || <span style={{ opacity: 0.3 }}>_ _ _</span>}
                    </div>

                    {phase === 'ai-speaking' && (
                        <p style={{ color: '#6b7280' }}>AI is speaking the letters…</p>
                    )}
                    {phase === 'user-speaking' && (
                        <p style={{ color: '#6b7280' }}>
                            {awaitingUserStart ? 'Tap the mic to start.' : 'Repeat the letters now.'}
                        </p>
                    )}
                    {gameEnded && (
                        <p style={{ color: '#6b7280', fontWeight: 700 }}>Session complete — 10 rounds done.</p>
                    )}
                </div>

                <form
                    onSubmit={handleTextSubmit}
                    style={{
                        display: 'flex',
                        gap: '10px',
                        width: 'min(520px, 90%)',
                        marginBottom: '10px'
                    }}
                >
                    <input
                        type="text"
                        placeholder="Type the letters here (A Y F U W)"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            fontSize: '1rem'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!gameStarted || phase !== 'user-speaking' || gameEnded}
                        style={{
                            padding: '12px 18px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'var(--color-primary)',
                            color: 'white',
                            fontWeight: 700,
                            cursor: 'pointer',
                            opacity: !gameStarted || phase !== 'user-speaking' ? 0.6 : 1
                        }}
                    >
                        Submit
                    </button>
                </form>

                {feedback && (
                    <div style={{
                        padding: '14px 20px',
                        borderRadius: '14px',
                        background: success
                            ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.2))'
                            : 'linear-gradient(135deg, rgba(248,113,113,0.2), rgba(251,146,60,0.2))',
                        color: 'var(--color-text-main)',
                        fontWeight: 700,
                        textAlign: 'center'
                    }}>
                        {feedback}
                    </div>
                )}

                {coach && (
                    <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>{coach}</div>
                )}

                {/* Mic Indicator - Now Fixed at Bottom */}
                {!gameEnded && (
                    <MicIndicator
                        isListening={isListening}
                        error={error}
                        onToggle={handleMicToggle}
                    />
                )}

            </div>
        </GameLayout>
    );
};

export default SpellingGame;
