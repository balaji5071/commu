import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionProps {
    onResult?: (final: string, interim: string) => void;
    onEnd?: () => void;
    continuous?: boolean;
}

export const useSpeechRecognition = ({
    onResult,
    onEnd,
    continuous = true
}: UseSpeechRecognitionProps = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [supported, setSupported] = useState(true);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const shouldBeListeningRef = useRef(false);
    const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 3;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onend = () => {
            setIsListening(false);

            // Auto-restart if we should still be listening
            if (shouldBeListeningRef.current && continuous) {
                // Small delay before restart to avoid rapid restarts
                restartTimeoutRef.current = setTimeout(() => {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.error('Failed to restart recognition:', e);
                    }
                }, 100);
            }

            if (onEnd) onEnd();
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (onResult) {
                onResult(finalTranscript.trim(), interimTranscript.trim());
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            // Handle permission errors specifically
            if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please enable microphone permissions in your browser settings.');
                shouldBeListeningRef.current = false; // Don't try to restart
                return;
            }

            console.error('Speech recognition error', event.error);

            // Handle HTTPS requirement
            if (event.error === 'service-not-allowed') {
                setError('Microphone requires HTTPS connection (except on localhost).');
                shouldBeListeningRef.current = false;
                return;
            }

            // Don't treat 'no-speech' as a critical error
            if (event.error !== 'no-speech') {
                setError(event.error);
            }

            // Auto-restart on certain errors if we should still be listening
            if (shouldBeListeningRef.current && continuous) {
                if (event.error === 'no-speech' || event.error === 'audio-capture') {
                    restartTimeoutRef.current = setTimeout(() => {
                        try {
                            recognition.start();
                        } catch (e) {
                            console.error('Failed to restart after error:', e);
                        }
                    }, 100);
                }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            shouldBeListeningRef.current = false;
            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [continuous, onEnd, onResult]);

    const start = useCallback(async () => {
        if (!recognitionRef.current) return;

        // Check microphone permission first (especially important for mobile)
        try {
            if (navigator.permissions && navigator.permissions.query) {
                const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });

                if (permissionStatus.state === 'denied') {
                    setError('Microphone access denied. Please enable microphone permissions in your browser settings.');
                    return;
                }
            }
        } catch (e) {
            // Permission API not supported, continue anyway
            console.log('Permission API not available, attempting to start anyway');
        }

        shouldBeListeningRef.current = true;
        try {
            if (isListening) {
                recognitionRef.current.stop();
                setTimeout(() => {
                    try {
                        recognitionRef.current?.start();
                    } catch (e) {
                        console.error('Failed to restart recognition:', e);
                    }
                }, 150);
                return;
            }
            recognitionRef.current.start();
        } catch (e: any) {
            // Handle "already started" error by restarting
            if (e.message && e.message.includes('already started')) {
                console.log('Speech recognition already running');
                recognitionRef.current.stop();
                setTimeout(() => {
                    try {
                        recognitionRef.current?.start();
                    } catch (err) {
                        console.error('Failed to restart recognition:', err);
                    }
                }, 150);
                return;
            }

            console.error('Failed to start recognition:', e);

            // Handle specific errors
            if (e.message && e.message.includes('not-allowed')) {
                setError('Microphone access denied. Please enable microphone permissions.');
                shouldBeListeningRef.current = false;
            }
        }
    }, [isListening]);

    const stop = useCallback(() => {
        shouldBeListeningRef.current = false;
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
        }
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    return {
        isListening,
        error,
        supported,
        start,
        stop
    };
};
