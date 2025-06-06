"use client"

import { Logo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"
import { Briefcase, CreditCard, ImageIcon, LayoutDashboard, Menu, Settings, TrendingUp, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Portfolio",
    href: "/dashboard/portfolio",
    icon: Briefcase,
  },
  {
    name: "Market",
    href: "/v0-dashboard",
    icon: TrendingUp,
  },
  {
    name: "NFTs",
    href: "/dashboard/nfts",
    icon: ImageIcon,
  },
  {
    name: "Contracts",
    href: "/dashboard/contracts",
    icon: CreditCard,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="border-b border-white/10 bg-black/90">
      <div className="flex h-20 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center"
          onClick={() => {
            console.log(`MobileNavbar: Logo clicked, navigating to /. Current pathname: ${pathname}`);
            setIsOpen(false)
          }}
        >
          <Logo size="small" variant="bordered" singleLine={true} />
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <nav className="border-t border-white/10 px-2 py-3">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                      isActive
                        ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white",
                    )}
                    onClick={() => {
                      console.log(`MobileNavbar: Item '${link.name}' clicked, navigating to ${link.href}. Current pathname: ${pathname}`);
                      setIsOpen(false)
                    }}
                  >
                    <link.icon className="mr-3 h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </div>
  )
}
