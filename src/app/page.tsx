'use client';

import React from 'react';
import MenuScreen from '@/components/MenuScreen';

export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <MenuScreen />
    </main>
  );
}
