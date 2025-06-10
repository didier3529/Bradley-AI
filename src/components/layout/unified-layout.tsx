"use client";

import { Container } from "@/components/ui/container";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';
import { Header } from "./header";
import { MobileNavbar } from "./mobile-navbar";
import { UnifiedSidebar } from "./unified-sidebar";

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-matrix-bg-black text-white p-6">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 matrix-text-cyber">SYSTEM ERROR</h2>
        <p className="mb-6 text-matrix-cyber-blue/80 font-['Fira_Code']">{error.message || "An unexpected error occurred"}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-matrix-cyber-blue/20 hover:bg-matrix-cyber-blue/30 text-matrix-cyber-blue rounded border border-matrix-cyber-blue/40 transition-colors font-['Fira_Code']"
        >
          [ RETRY_SYSTEM ]
        </button>
      </div>
    </div>
  );
}

interface UnifiedLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  fullWidth?: boolean;
  containerSize?: 'default' | 'small' | 'large';
  noSpacing?: boolean;
  className?: string;
}

export function UnifiedLayout({
  children,
  title,
  description,
  actions,
  fullWidth = false,
  containerSize = 'default',
  noSpacing = false,
  className,
}: UnifiedLayoutProps) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Paths that should use dashboard layout
  const dashboardPaths = [
    '/',                    // Root path now uses dashboard layout
    '/dashboard',
    '/dashboard/portfolio',
    '/',
    '/dashboard/nfts',
    '/dashboard/contracts',
    '/dashboard/settings'
  ];

  const isDashboardLayout = dashboardPaths.some(p => pathname.startsWith(p)) || pathname === '/';

  // Dashboard Layout with Matrix styling
  if (isDashboardLayout) {
    return (
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          window.location.href = '/dashboard';
        }}
      >
        <div className="min-h-screen bg-matrix-bg-black text-white relative overflow-hidden">
          {/* Matrix Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Primary Matrix Grid */}
            <div className="absolute inset-0 matrix-grid opacity-5" />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-matrix-bg-black via-matrix-bg-dark/50 to-matrix-bg-black" />
            <div className="absolute inset-0 bg-gradient-to-t from-matrix-bg-black/80 via-transparent to-matrix-bg-dark/30" />

            {/* Subtle Matrix Rain Effect Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-matrix-green/20 to-transparent animate-pulse" style={{ left: '10%' }} />
              <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-matrix-cyber-blue/20 to-transparent animate-pulse" style={{ left: '30%', animationDelay: '1s' }} />
              <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-matrix-green/20 to-transparent animate-pulse" style={{ left: '60%', animationDelay: '2s' }} />
              <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-matrix-cyber-blue/20 to-transparent animate-pulse" style={{ left: '85%', animationDelay: '0.5s' }} />
            </div>

            {/* Corner Accent Lines */}
            <div className="absolute top-0 left-0 w-32 h-px bg-gradient-to-r from-matrix-cyber-blue via-matrix-green to-transparent opacity-40" />
            <div className="absolute top-0 right-0 w-32 h-px bg-gradient-to-l from-matrix-cyber-blue via-matrix-green to-transparent opacity-40" />
            <div className="absolute bottom-0 left-0 w-32 h-px bg-gradient-to-r from-matrix-green via-matrix-cyber-blue to-transparent opacity-40" />
            <div className="absolute bottom-0 right-0 w-32 h-px bg-gradient-to-l from-matrix-green via-matrix-cyber-blue to-transparent opacity-40" />
          </div>

          {/* Layout Content */}
          <div className="relative z-10">
            {!isMobile && <UnifiedSidebar />}
            <main className={cn("transition-all duration-300", isMobile ? '' : 'ml-64')}>
              {isMobile ? <MobileNavbar /> : <Header />}
              <div className="p-8">
                {(title || description || actions) && (
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                      {title && (
                        <h1 className="text-2xl font-semibold tracking-tight matrix-text-cyber">
                          {title}
                        </h1>
                      )}
                      {description && (
                        <p className="text-sm text-matrix-cyber-blue/60 font-['Fira_Code']">
                          {description}
                        </p>
                      )}
                    </div>
                    {actions && <div className="flex items-center gap-4">{actions}</div>}
                  </div>
                )}
                <div className="space-y-6">{children}</div>
              </div>
            </main>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Landing/Default Layout
  return (
    <div
      className={cn(
        'relative',
        !noSpacing && 'py-16 md:py-20 lg:py-24',
        className
      )}
    >
      {fullWidth ? (
        children
      ) : (
        <Container size={containerSize}>
          {(title || description || actions) && (
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                {title && (
                  <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-4">{actions}</div>}
            </div>
          )}
          {children}
        </Container>
      )}
    </div>
  );
}
