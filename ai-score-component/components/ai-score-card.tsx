import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, TrendingUp, Zap, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

interface AIScoreCardProps {
  username?: string
  profileImage?: string
  aiScore?: number
  status?: "ELITE" | "PRO" | "RISING" | "STANDARD"
  isHot?: boolean
  walletAddress?: string
  volume?: string
}

export default function AIScoreCard({
  username = "MICHI",
  profileImage = "/placeholder.svg?height=48&width=48",
  aiScore = 91,
  status = "ELITE",
  isHot = true,
  walletAddress = "ED5nyyME...HzPJBY",
  volume = "$687,309.301",
}: AIScoreCardProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ELITE":
        return "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
      case "PRO":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
      case "RISING":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white"
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
    }
  }

  const getScoreGradient = (score: number) => {
    if (score >= 90) return "from-emerald-400 via-green-500 to-emerald-600"
    if (score >= 80) return "from-blue-400 via-blue-500 to-blue-600"
    if (score >= 70) return "from-orange-400 via-orange-500 to-orange-600"
    return "from-gray-400 via-gray-500 to-gray-600"
  }

  return (
    <Card className="w-full max-w-sm bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
      <CardContent className="p-6">
        {/* Header with Profile */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-slate-600">
              <AvatarImage src={profileImage || "/placeholder.svg"} alt={username} />
              <AvatarFallback className="bg-slate-700 text-slate-200">{username.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-white text-lg">{username}</h3>
              <p className="text-slate-400 text-sm font-mono">{walletAddress}</p>
            </div>
          </div>
          {isHot && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
              <Zap className="w-3 h-3 mr-1" />
              HOT
            </Badge>
          )}
        </div>

        {/* AI Score Display */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div
              className={`text-6xl font-black bg-gradient-to-br ${getScoreGradient(aiScore)} bg-clip-text text-transparent mb-2`}
            >
              {aiScore}
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">AI</span>
              </div>
            </div>
          </div>
          <Badge className={`${getStatusColor(status)} px-4 py-1 text-sm font-bold shadow-lg`}>{status}</Badge>
        </div>

        {/* Volume Section */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">VOLUME</p>
              <p className="text-white text-xl font-bold">{volume}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            VIEW CHART
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            className={`transition-all duration-200 ${
              copied
                ? "bg-green-600 border-green-500 text-white"
                : "bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
