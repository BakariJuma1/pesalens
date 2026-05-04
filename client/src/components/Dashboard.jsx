import { useState } from 'react'
import { Share2, RotateCcw, Shield } from 'lucide-react'
import SummaryStats from './SummaryStats'
import AIAnalysisCard from './AIAnalysisCard'
import CategoryChart from './CategoryChart'
import MonthlyChart from './MonthlyChart'
import TopExpenses from './TopExpenses'
import TransactionsTable from './TransactionsTable'
import ShareCardModal from './ShareCardModal'

export default function Dashboard({ data, onReset }) {
  const [showShare, setShowShare] = useState(false)
  const { summary, categories, monthly, transactions, ai_analysis, top_expenses, parse_method } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00A86B] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">M-Pesa Analyzer</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1.5 bg-[#00A86B] hover:bg-[#007A4D] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share My Month
            </button>
            <button
              onClick={onReset}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors"
              title="Analyse another statement"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Transactions count badge */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {summary.total_transactions} transactions analysed
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
            <Shield className="w-3 h-3" />
            Not saved — processed in memory only
          </div>
        </div>

        <SummaryStats summary={summary} />
        <AIAnalysisCard analysis={ai_analysis} parseMethod={parse_method} />
        <CategoryChart categories={categories} />
        <MonthlyChart monthly={monthly} />
        <TopExpenses expenses={top_expenses} />
        <TransactionsTable transactions={transactions} />

        <p className="text-center text-xs text-gray-400 pb-4">
          M-Pesa Analyzer · Open source · Free forever
        </p>
      </main>

      {showShare && (
        <ShareCardModal data={data} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}
