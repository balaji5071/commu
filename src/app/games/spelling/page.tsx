'use client';

import { useRouter } from 'next/navigation';
import SpellingGame from '@/components/games/SpellingGame';

export default function SpellingGamePage() {
    const router = useRouter();

    return <SpellingGame onBack={() => router.push('/')} />;
}
