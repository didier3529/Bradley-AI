"use client"

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect - no delays, no complex state management
    router.replace('/v0-dashboard');

    // Simple fallback after 1 second only if still on home page
    const fallbackTimer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        window.location.href = '/v0-dashboard';
      }
    }, 1000);

    return () => clearTimeout(fallbackTimer);
  }, [router]);

  // Minimal loading UI - no complex animations or states
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-cyan-400 font-mono text-lg animate-pulse">
          BRADLEY AI
        </div>
        <div className="text-gray-400 text-sm mt-2">
          Loading...
        </div>
      </div>
    </div>
  );
}
