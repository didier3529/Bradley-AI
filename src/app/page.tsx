"use client"

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // INSTANT redirect - no loading screen, no delays
    router.replace('/v0-dashboard');
  }, [router]);

  // NO LOADING SCREEN - Just black background during instant redirect
  return <div className="min-h-screen bg-black" />;
}
