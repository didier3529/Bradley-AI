'use client'

import { motion } from 'framer-motion'
import { Search, TrendingUp } from 'lucide-react'

export function TestGemScanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="relative overflow-hidden rounded-lg border border-cyan-500/30 bg-gradient-to-br from-black/90 via-slate-900/80 to-black/90 shadow-2xl shadow-cyan-500/20 backdrop-blur-md p-6"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <Search className="w-4 h-4 text-black" />
          </div>
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-sm animate-pulse"></div>
        </div>
        <div>
          <h2 className="text-xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            TEST GEM SCANNER
          </h2>
          <p className="text-xs text-slate-400">
            Testing component rendering
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">$</span>
            </div>
            <div>
              <div className="font-mono font-bold text-white">TEST TOKEN</div>
              <div className="text-xs text-slate-400">Testing component</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-green-400 font-mono">+15.2%</div>
            <div className="text-xs text-slate-400">AI Score: 85%</div>
          </div>
        </div>

        <div className="text-center p-4 border border-dashed border-slate-600 rounded-lg">
          <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">
            If you can see this, the component is rendering correctly!
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default TestGemScanner
