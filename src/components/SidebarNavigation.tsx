"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ChevronRight,
  CuboidIcon as Cube,
  MessageCircle,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

interface SidebarNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const MENU_ITEMS: MenuItem[] = [
  { id: "gem-scanner", label: "GEM SCANNER", icon: Search },
  { id: "market-intelligence", label: "MARKET INTELLIGENCE", icon: TrendingUp },
  { id: "nft-analysis", label: "NFT MARKET ANALYSIS", icon: Cube },
  { id: "portfolio", label: "PORTFOLIO HOLDINGS", icon: Wallet },
  { id: "chatbot", label: "SOLANA CHATBOT", icon: MessageCircle },
];

interface SidebarStats {
  uptime: string;
  tokens: string;
  gems: string;
}

const SIDEBAR_STATS: SidebarStats = {
  uptime: "24/7 LIVE",
  tokens: "12.4K TRACKED",
  gems: "847 DISCOVERED",
};

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const toggleSidebar = (): void => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSectionChange = (sectionId: string): void => {
    onSectionChange(sectionId);
  };

  return (
    <>
      {/* Sidebar */}
      <motion.div
        className={`${
          sidebarCollapsed ? "w-16" : "w-70"
        } bg-[#1a1a1a] border-r border-neutral-600 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${
          !sidebarCollapsed ? "md:block" : ""
        }`}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div className="p-4">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-orange-500 font-bold text-4xl tracking-wider mb-2">
                MEXMA
              </h1>
              <p className="text-neutral-500 text-lg font-medium">
                v2.1.7 CRYPTO INTEL
              </p>
            </motion.div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-neutral-400 hover:text-orange-500"
            >
              <ChevronRight
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                  sidebarCollapsed ? "" : "rotate-180"
                }`}
              />
            </Button>
          </motion.div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {MENU_ITEMS.map((item: MenuItem, index: number) => (
              <motion.button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`w-full flex items-center rounded transition-colors ${
                  sidebarCollapsed ? "justify-center p-2" : "gap-3 p-3"
                } ${
                  activeSection === item.id
                    ? "bg-orange-500 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon
                  className={`${sidebarCollapsed ? "w-10 h-10" : "w-8 h-8"}`}
                />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </motion.button>
            ))}
          </nav>

          {/* Status Panel */}
          {!sidebarCollapsed && (
            <motion.div
              className="mt-8 p-4 bg-[#2a2a2a] border border-neutral-600 rounded"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className="flex items-center gap-2 mb-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                />
                <span className="text-xs text-white">MARKET ONLINE</span>
              </motion.div>
              <motion.div className="text-xs text-neutral-500">
                <div>UPTIME: {SIDEBAR_STATS.uptime}</div>
                <div>TOKENS: {SIDEBAR_STATS.tokens}</div>
                <div>GEMS: {SIDEBAR_STATS.gems}</div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </>
  );
};

export default SidebarNavigation;
