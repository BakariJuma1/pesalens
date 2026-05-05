function fmt(n) {
  return `KES ${Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

export default function WithdrawalTracker({ data }) {
  if (!data) return null
  const { total_withdrawn, total_digital, cash_percentage, withdrawal_count } = data
  if (total_withdrawn === 0 && total_digital === 0) return null

  const digitalPct = Math.round(100 - cash_percentage)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Cash vs Digital Spending</h2>
      <p className="text-xs text-gray-400 mb-4">
        Cash withdrawals are untracked — this shows how much left your M-Pesa vs stayed digital
      </p>

      <div className="flex flex-col gap-3">
        {/* Bar */}
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-[#00A86B] rounded-l-full transition-all"
            style={{ width: `${digitalPct}%` }}
          />
          <div
            className="h-full bg-orange-400 rounded-r-full transition-all"
            style={{ width: `${cash_percentage}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00A86B] flex-shrink-0" />
              <span className="text-xs text-gray-500">Digital</span>
            </div>
            <p className="text-base font-bold text-gray-900">{fmt(total_digital)}</p>
            <p className="text-xs text-gray-400">{digitalPct}% of spending</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 flex-shrink-0" />
              <span className="text-xs text-gray-500">Cash withdrawn</span>
            </div>
            <p className="text-base font-bold text-gray-900">{fmt(total_withdrawn)}</p>
            <p className="text-xs text-gray-400">{cash_percentage}% · {withdrawal_count} withdrawal{withdrawal_count !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {cash_percentage > 30 && (
          <p className="text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
            Over {cash_percentage}% of your spending left as cash. That money is untracked — consider paying digitally where possible.
          </p>
        )}
      </div>
    </div>
  )
}
