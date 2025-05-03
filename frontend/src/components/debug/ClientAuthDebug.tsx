'use client';

import dynamic from 'next/dynamic';

// Dynamically import the AuthDebug component with SSR disabled
const AuthDebug = dynamic(() => import('./AuthDebug'), { ssr: false });

export default function ClientAuthDebug() {
  return <AuthDebug />;
}
