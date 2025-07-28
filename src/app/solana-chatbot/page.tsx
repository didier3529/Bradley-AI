"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Image as ImageIcon,
  Send,
  TrendingUp,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export default function SolanaChatbotPage() {
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

  const predefinedResponses = [
    {
      keywords: ["price", "sol", "solana"],
      response:
        "Current SOL price is $98.45 (+5.23% 24h). Market cap: $42.1B. Solana is showing strong momentum with increased DeFi activity and NFT trading volume.",
    },
    {
      keywords: ["defi", "protocols", "yield"],
      response:
        "Top Solana DeFi protocols: 1) Jupiter (DEX Aggregator) 2) Raydium (AMM) 3) Orca (DEX) 4) Marinade (Liquid Staking) 5) Mango Markets (Derivatives). Current TVL: $1.2B across ecosystem.",
    },
    {
      keywords: ["nft", "collections", "magic eden"],
      response:
        "Solana NFT ecosystem is thriving! Top collections: Okay Bears, DeGods, y00ts. Magic Eden dominates with 90%+ market share. Floor prices recovering with increased utility and gaming integration.",
    },
    {
      keywords: ["meme", "tokens", "gems"],
      response:
        "Solana meme token hotspots: 1) Pump.fun for new launches 2) Raydium for established tokens 3) Jupiter for best prices. Always DYOR - high volatility and rug pull risks!",
    },
    {
      keywords: ["wallet", "phantom", "solflare"],
      response:
        "Recommended Solana wallets: Phantom (most popular), Solflare (advanced features), Backpack (new, xNFT support). Always verify official websites and enable 2FA for security.",
    },
    {
      keywords: ["staking", "validators", "rewards"],
      response:
        "Solana staking APY: ~7-8%. Top validators: Shinobi Systems, Chorus One, Figment. Consider decentralization when choosing. Liquid staking via Marinade offers flexibility with mSOL.",
    },
  ];

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    for (const response of predefinedResponses) {
      if (response.keywords.some((keyword) => lowerMessage.includes(keyword))) {
        return response.response;
      }
    }

    // Default responses
    const defaultResponses = [
      "Interesting question! The Solana ecosystem is constantly evolving. Could you be more specific about what aspect you'd like to explore?",
      "I'm analyzing the latest Solana data for you. The network is processing ~3,000 TPS with sub-second finality. What specific metrics are you interested in?",
      "Based on current market conditions, Solana shows strong fundamentals. Would you like me to dive deeper into any particular area like DeFi, NFTs, or development activity?",
      "The Solana ecosystem has over 400+ projects building. I can provide insights on DeFi protocols, NFT collections, or emerging trends. What interests you most?",
    ];

    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate bot thinking time
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
    setInputMessage(tabName);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const tabs = [
    { name: "SOL Price", icon: TrendingUp },
    { name: "DeFi Protocols", icon: Zap },
    { name: "NFT Collections", icon: ImageIcon },
    { name: "Wallet Guide", icon: Wallet },
  ];

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
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
