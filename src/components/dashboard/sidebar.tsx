'use client';

import { cn } from '@/lib/utils';
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', href: '/dashboard/portfolio', icon: Wallet },
  { name: 'Market', href: '/v0-dashboard', icon: TrendingUp },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-black/90 border-r border-cyan-400/20 p-4">
      {/* Logo/Brand */}
      <div className="mb-8">
        <h2 className="text-2xl font-mono font-bold text-cyan-400">
          MATRIX AI
        </h2>
        <p className="text-xs text-gray-400 font-mono">
          DASHBOARD v2.0
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                'font-mono text-sm',
                isActive
                  ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div className="mt-8 p-3 bg-gray-900/50 rounded border border-green-400/30">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-green-400" />
          <span className="text-green-400 font-mono text-sm font-bold">LIVE</span>
        </div>
        <div className="text-xs text-gray-400 font-mono">
          Real-time market data active
        </div>
      </div>
    </div>
  );
} 