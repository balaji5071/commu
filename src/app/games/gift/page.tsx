'use client';

import { useRouter } from 'next/navigation';
import GiftGame from '@/components/games/GiftGame';

export default function GiftGamePage() {
    const router = useRouter();

    return <GiftGame onBack={() => router.push('/')} />;
}
