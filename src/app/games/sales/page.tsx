'use client';

import { useRouter } from 'next/navigation';
import SalesGame from '@/components/games/SalesGame';

export default function SalesGamePage() {
    const router = useRouter();

    return <SalesGame onBack={() => router.push('/')} />;
}
