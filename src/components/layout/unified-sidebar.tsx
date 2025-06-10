"use client"

import { Logo } from "@/components/ui/logo"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAuth } from "@/lib/providers/auth-provider"
import { cn } from "@/lib/utils"
import {
    BarChart3,
    FileCode,
    Gem,
    LayoutDashboard,
    LineChart,
    LogOut,
    Settings,
    Zap
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  href: string
  description?: string
  isActive: boolean
}

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of your portfolio and market",
  },
  {
    label: "Portfolio",
    href: "/dashboard/portfolio",
    icon: BarChart3,
    description: "Track and manage your assets",
  },
  {
    label: "Market Analysis",
    href: "/",
    icon: LineChart,
    description: "Market trends and analysis",
  },
  {
    label: "Smart Contracts",
    href: "/dashboard/contracts",
    icon: FileCode,
    description: "Smart contract security and analysis",
  },
  {
    label: "NFT Analysis",
    href: "/dashboard/nfts",
    icon: Gem,
    description: "NFT collections and analytics",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Account and application settings",
  },
]

function SidebarItem({ icon, label, href, description, isActive }: SidebarItemProps) {
  const pathname = usePathname()

  const handleNavigation = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    console.log(`🚀 NAVIGATION: ${label} -> ${href} (current: ${pathname})`)

    // Multi-method navigation approach for 100% reliability
    try {
      // Method 1: Next.js router (preferred)
      const router = useRouter()
      router.push(href)
      console.log(`✅ Next.js router navigation initiated to ${href}`)

      // Add a small delay to check if navigation worked
      setTimeout(() => {
        if (window.location.pathname === pathname) {
          console.log(`⚠️ Router navigation may have failed, using fallback`)
          window.location.href = href
        }
      }, 100)

    } catch (error) {
      console.warn(`⚠️ Next.js router failed:`, error)

      // Method 2: Direct window.location (most reliable fallback)
      console.log(`🔄 Using window.location fallback for ${href}`)
      window.location.href = href
    }
  }

  return (
    <button
      type="button"
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 rounded transition-all duration-200 cursor-pointer text-left border-0 bg-transparent focus:outline-none group relative overflow-hidden font-['Fira_Code']",
        isActive
          ? "bg-matrix-cyber-blue/20 text-matrix-cyber-blue border border-matrix-cyber-blue/40 shadow-cyber-glow"
          : "text-matrix-cyber-blue/60 hover:text-matrix-cyber-blue hover:bg-matrix-cyber-blue/10 hover:border-matrix-cyber-blue/20 border border-transparent",
      )}
      onClick={handleNavigation}
      aria-label={`Navigate to ${label}`}
    >
      {/* Matrix background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-matrix-cyber-blue/5 via-transparent to-matrix-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className={cn(
        "w-6 h-6 flex items-center justify-center relative z-10",
        isActive && "text-matrix-cyber-blue"
      )}>
        {icon}
      </div>
      <span className="relative z-10 text-sm font-medium">{label}</span>

      {/* Active indicator */}
      {isActive && (
        <div className="ml-auto relative z-10">
          <div className="w-2 h-6 bg-gradient-to-b from-matrix-cyber-blue to-matrix-green rounded-full animate-pulse" />
        </div>
      )}

      {/* Corner accents for active state */}
      {isActive && (
        <>
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-matrix-cyber-blue opacity-50" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-matrix-cyber-blue opacity-50" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-matrix-cyber-blue opacity-50" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-matrix-cyber-blue opacity-50" />
        </>
      )}
    </button>
  )
}

export function UnifiedSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768
      setIsMobile(isMobileView)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-matrix-bg-black/95 backdrop-blur-md border-r border-matrix-cyber-blue/20 matrix-gpu-accelerated">
        {/* Matrix Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }} />

          {/* Vertical accent lines */}
          <div className="absolute top-0 left-4 w-px h-full bg-gradient-to-b from-transparent via-matrix-cyber-blue/20 to-transparent" />
          <div className="absolute top-0 right-4 w-px h-full bg-gradient-to-b from-transparent via-matrix-green/20 to-transparent" />
        </div>

        {/* Header */}
        <div className="relative z-10 flex h-20 items-center border-b border-matrix-cyber-blue/30 px-4">
          <Link href="/dashboard" className="flex items-center overflow-hidden">
            <Logo size="medium" variant="bordered" singleLine={true} />
          </Link>
          {/* Status indicator */}
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse"></div>
            <span className="text-xs matrix-text-cyber opacity-60 font-['Fira_Code']">ACTIVE</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 overflow-y-auto p-4">
          {/* Section Header */}
          <div className="mb-4 pb-2 border-b border-matrix-cyber-blue/20">
            <h3 className="text-xs font-medium matrix-text-cyber uppercase tracking-wider font-['Fira_Code']">
              [ NAVIGATION_MATRIX ]
            </h3>
          </div>

          <ul className="space-y-2">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
              return (
                <li key={link.href}>
                  <SidebarItem
                    icon={<link.icon size={18} />}
                    label={link.label}
                    href={link.href}
                    description={link.description}
                    isActive={isActive}
                  />
                </li>
              )
            })}
          </ul>

          {/* Quick Stats */}
          <div className="mt-8 p-3 bg-matrix-bg-dark/50 border border-matrix-green/20 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-matrix-green" />
              <span className="text-xs font-medium matrix-text uppercase font-['Fira_Code']">
                SYSTEM STATUS
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-matrix-cyber-blue/60 font-['Fira_Code']">API_STATUS:</span>
                <span className="text-matrix-green font-['Fira_Code']">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-matrix-cyber-blue/60 font-['Fira_Code']">SECURITY:</span>
                <span className="text-matrix-green font-['Fira_Code']">SECURED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-matrix-cyber-blue/60 font-['Fira_Code']">UPTIME:</span>
                <span className="text-matrix-cyber-blue font-['Fira_Code']">99.9%</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="relative z-10 border-t border-matrix-cyber-blue/30 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded px-3 py-3 text-matrix-cyber-blue/60 hover:bg-matrix-cyber-blue/10 hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-400/20 font-['Fira_Code'] group"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">[ DISCONNECT ]</span>
            <div className="ml-auto w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity" />
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
