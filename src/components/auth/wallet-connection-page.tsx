"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/providers/auth-provider"
import { toast } from "@/components/ui/use-toast"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Logo } from "@/components/ui/logo"

export function WalletConnectionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { connectWallet, isAuthenticated } = useAuth()

  const handleConnectWallet = async () => {
    try {
      setIsLoading(true)
      
      // If already authenticated, navigate to dashboard
      if (isAuthenticated) {
        router.push("/dashboard")
        return
      }
      
      // Connect wallet and authenticate
      const success = await connectWallet()
      
      if (success) {
        // Only navigate to dashboard if connection was successful
        router.push("/dashboard")
      } else {
        toast({
          title: "Connection failed",
          description: "Could not connect to wallet. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Connection error:", error)
      toast({
        title: "Connection error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive", 
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
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
                Bradley AI
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              Connect your wallet to access AI-powered blockchain analytics
            </p>
          </div>

          {/* Connect Button */}
          <div className="space-y-4">
            <Button
              onClick={handleConnectWallet}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 rounded-lg text-lg font-medium"
              size="lg"
            >
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </Button>
            
            <p className="text-sm text-gray-400">
              Securely connect your wallet to get started
            </p>
          </div>

          {/* Features Preview */}
          <div className="pt-8 space-y-4">
            <div className="grid grid-cols-1 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Portfolio analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Real-time market data</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span className="text-sm text-gray-300">AI-powered insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 