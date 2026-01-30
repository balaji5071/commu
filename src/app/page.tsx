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
      width: '100%',
      position: 'relative',
      overflowX: 'hidden',
      paddingTop: '40px',
      paddingBottom: '40px'
    }}>
      <MenuScreen />
    </main>
  );
}
