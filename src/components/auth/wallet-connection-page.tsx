"use client";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { Logo } from "@/components/ui/logo";
import { WalletConnection } from "@/components/wallet-connection";
import { useAuth } from "@/lib/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function WalletConnectionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    router.push("/dashboard");
    return <LoadingScreen />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo
              size="large"
              variant="bordered"
              singleLine={true}
              className="py-1"
            />
          </div>

          {/* Welcome Text */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                Bradley
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              Connect your wallet to access blockchain analytics
            </p>
          </div>

          {/* Connect Wallet Component */}
          <div className="space-y-4">
            <WalletConnection />

            <p className="text-sm text-gray-400">
              Securely connect your wallet to get started
            </p>
          </div>

          {/* Features Preview */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-300">
                  Portfolio analytics
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-300">
                  Real-time market data
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span className="text-sm text-gray-300">
                  AI-powered insights
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
