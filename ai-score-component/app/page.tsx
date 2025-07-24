import AIScoreCard from "@/components/ai-score-card"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">AI Score Component</h1>
          <p className="text-slate-400">Modern design for your trading app</p>
        </div>

        <div className="flex flex-wrap gap-6 justify-center">
          {/* Default ELITE Score */}
          <AIScoreCard />

          {/* PRO Score Example */}
          <AIScoreCard
            username="ALEX"
            aiScore={85}
            status="PRO"
            isHot={false}
            walletAddress="BC1qxy7r...9p2zt"
            volume="$423,156.789"
          />

          {/* RISING Score Example */}
          <AIScoreCard
            username="SARA"
            aiScore={76}
            status="RISING"
            isHot={true}
            walletAddress="0x742d35...8f4a"
            volume="$156,892.234"
          />
        </div>
      </div>
    </div>
  )
}
