import { useState } from 'react'
import SummaryStats from './SummaryStats'
import AIAnalysisCard from './AIAnalysisCard'
import CategoryChart from './CategoryChart'
import MonthlyChart from './MonthlyChart'
import TopExpenses from './TopExpenses'
import TopRecipients from './TopRecipients'
import TransactionsTable from './TransactionsTable'
import ShareCardModal from './ShareCardModal'
import BalanceCurve from './BalanceCurve'
import DayOfWeekChart from './DayOfWeekChart'
import RecurringPayments from './RecurringPayments'
import WithdrawalTracker from './WithdrawalTracker'
import PaydayInsight from './PaydayInsight'
import TopMerchants from './TopMerchants'
import SendMoneyFrequency from './SendMoneyFrequency'
import HealthScore from './HealthScore'
import FulizaInsight from './FulizaInsight'
import IncomeBreakdown from './IncomeBreakdown'

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="9" stroke="#00A86B" strokeWidth="2.5" />
      <path d="M21 21L30 30" stroke="#00A86B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M11 14h6M14 11v6" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Dashboard({ data, onReset }) {
  const [showShare, setShowShare] = useState(false)
  const {
    summary, categories, monthly, transactions, ai_analysis,
    top_expenses, top_recipients, parse_method,
    balance_timeline, day_of_week, recurring_payments,
    withdrawal_summary, payday_info, top_merchants, send_money_frequency,
    fuliza_usage, income_breakdown, health_score,
  } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-bold text-gray-900 text-sm tracking-tight">PesaLense</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShare(true)}
              className="bg-[#00A86B] hover:bg-[#007A4D] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Share My Month
            </button>
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors text-xs font-medium"
            >
              New
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {summary.total_transactions} transactions analysed
          </p>
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
            Not saved. Processed in memory only.
          </span>
        </div>

        <SummaryStats summary={summary} />
        <HealthScore data={health_score} />
        <AIAnalysisCard analysis={ai_analysis} parseMethod={parse_method} />
        <BalanceCurve data={balance_timeline} />
        <CategoryChart categories={categories} />
        <WithdrawalTracker data={withdrawal_summary} />
        <FulizaInsight data={fuliza_usage} />
        <PaydayInsight data={payday_info} />
        <DayOfWeekChart data={day_of_week} />
        <MonthlyChart monthly={monthly} />
        <RecurringPayments data={recurring_payments} />
        <TopMerchants data={top_merchants} />
        <SendMoneyFrequency data={send_money_frequency} />
        <IncomeBreakdown data={income_breakdown} totalIn={summary.total_in} />
        <TopExpenses expenses={top_expenses} />
        <TopRecipients recipients={top_recipients} />
        <TransactionsTable transactions={transactions} />

        <p className="text-center text-xs text-gray-400 pb-4">
          PesaLense · Free forever
        </p>
      </main>

      {showShare && (
        <ShareCardModal data={data} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}
