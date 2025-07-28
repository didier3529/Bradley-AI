"use client";

import { SidebarNavigation } from "@/components/SidebarNavigation";
import DirectPriceDisplay from "@/components/direct-price-display";
import { BradleyGemScanner } from "@/components/gem-scanner/bradley-gem-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NFTMarketAnalysis } from "@/components/v0-dashboard/nft-market-analysis";
import { PortfolioHoldings } from "@/components/v0-dashboard/portfolio-holdings";
import {
  Bot,
  Image as ImageIcon,
  Send,
  TrendingUp,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

type ActiveSection =
  | "gem-scanner"
  | "market-intelligence"
  | "nft-analysis"
  | "portfolio"
  | "chatbot";

export default function TacticalDashboard() {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("gem-scanner");

  const handleSectionChange = (section: string): void => {
    setActiveSection(section as ActiveSection);
  };

  const renderActiveSection = (): JSX.Element => {
    switch (activeSection) {
      case "gem-scanner":
        return (
          <div className="p-6">
            <BradleyGemScanner />
          </div>
        );
      case "market-intelligence":
        return (
          <div className="p-6">
            <DirectPriceDisplay />
          </div>
        );
      case "nft-analysis":
        return (
          <div className="p-6">
            <NFTMarketAnalysis />
          </div>
        );
      case "portfolio":
        return (
          <div className="p-6">
            <PortfolioHoldings />
          </div>
        );
      case "chatbot":
        return (
          <div className="p-6 h-full flex flex-col">
            {/* Solana Chatbot Component */}
            <SolanaChatbotComponent />
          </div>
        );
      default:
        return (
          <div className="p-6">
            <BradleyGemScanner />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      <SidebarNavigation
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Dashboard Content - Full Height */}
        <div className="flex-1 overflow-auto bg-[#1a1a1a]">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
}

// Solana Chatbot Component (moved from standalone page)
function SolanaChatbotComponent() {
  interface Message {
    id: string;
    type: "user" | "bot";
    content: string;
    timestamp: Date;
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Welcome to MEXMA Solana Assistant! I can help you with Solana ecosystem queries, DeFi protocols, token analysis, and trading insights. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("SOL Price");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const predefinedResponses = {
    "SOL Price":
      "Current SOL price is $78.74 with a 24h change of +8.91%. Market cap: $38.1B. The price has been showing strong bullish momentum with increasing volume and positive sentiment across social platforms.",
    "DeFi Protocols":
      "Top Solana DeFi protocols include: 1) Jupiter - Leading DEX aggregator, 2) Raydium - AMM and liquidity provider, 3) Marinade Finance - Liquid staking, 4) Solend - Lending protocol. Total Value Locked (TVL) in Solana DeFi: $1.2B+",
    "NFT Collections":
      "Popular Solana NFT collections: 1) Solana Monkey Business (SMB) - Floor: 12.5 SOL, 2) Okay Bears - Floor: 8.2 SOL, 3) Magic Eden is the primary marketplace. Solana NFT volume has been recovering with innovative projects launching frequently.",
    "Wallet Guide":
      "Recommended Solana wallets: 1) Phantom - Most popular, browser extension & mobile, 2) Solflare - Advanced features, hardware wallet support, 3) Backpack - New, xNFT ecosystem. Always use official websites and verify authenticity before downloading.",
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    if (message.includes("price") || message.includes("sol")) {
      return predefinedResponses["SOL Price"];
    } else if (
      message.includes("defi") ||
      message.includes("protocol") ||
      message.includes("yield")
    ) {
      return predefinedResponses["DeFi Protocols"];
    } else if (
      message.includes("nft") ||
      message.includes("collection") ||
      message.includes("art")
    ) {
      return predefinedResponses["NFT Collections"];
    } else if (
      message.includes("wallet") ||
      message.includes("phantom") ||
      message.includes("setup")
    ) {
      return predefinedResponses["Wallet Guide"];
    } else if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("hey")
    ) {
      return "Hello! I'm your Solana ecosystem assistant. I can help you with price analysis, DeFi protocols, NFT collections, and wallet setup. What would you like to know?";
    } else {
      return "I'm here to help with Solana-related questions! Ask me about SOL price, DeFi protocols, NFT collections, or wallet guidance. You can also click the tabs above for quick information.";
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: generateBotResponse(inputMessage),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);

    if (predefinedResponses[tabName as keyof typeof predefinedResponses]) {
      const botMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content:
          predefinedResponses[tabName as keyof typeof predefinedResponses],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tabs = [
    { name: "SOL Price", icon: TrendingUp },
    { name: "DeFi Protocols", icon: Zap },
    { name: "NFT Collections", icon: ImageIcon },
    { name: "Wallet Guide", icon: Wallet },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Main Chat Container */}
      <div className="relative overflow-hidden rounded-lg border border-neutral-600 bg-[#1a1a1a] shadow-2xl shadow-neutral-500/20 flex-1 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-neutral-600 bg-[#1a1a1a]">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab.name)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.name
                  ? "text-white bg-[#1a1a1a] border-b-2 border-orange-500"
                  : "text-neutral-400 hover:text-neutral-300 hover:bg-neutral-700/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Chat Interface Header */}
        <div className="p-4 border-b border-neutral-600 bg-[#1a1a1a]">
          <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wide">
            CHAT INTERFACE
          </h2>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#1a1a1a]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.type === "bot" && (
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-orange-500 text-white ml-auto"
                      : "bg-neutral-700 text-neutral-100"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <p
                  className={`text-xs text-neutral-400 mt-1 ${
                    message.type === "user" ? "text-right mr-2" : "ml-2"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
              {message.type === "user" && (
                <div className="w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-neutral-700 text-neutral-300 px-4 py-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-neutral-600 bg-[#1a1a1a]">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Solana ecosystem, DeFi, NFTs, or trading..."
              className="flex-1 bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400 focus:border-orange-500/50"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
