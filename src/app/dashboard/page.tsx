"use client"

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the consolidated V0 dashboard
    router.replace('/v0-dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black text-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-cyan-400 font-mono text-xl mb-4 animate-pulse">
          REDIRECTING TO UNIFIED DASHBOARD...
        </div>
        <div className="text-gray-400 text-sm font-mono">
          [ CONSOLIDATION COMPLETE - ENHANCED V0 DASHBOARD LOADING ]
        </div>
      </div>
    </div>
  );
}
