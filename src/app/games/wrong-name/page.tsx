'use client';

import { useRouter } from 'next/navigation';
import WrongName from '@/components/games/WrongName';

export default function WrongNamePage() {
    const router = useRouter();

    return <WrongName onBack={() => router.push('/')} />;
}
