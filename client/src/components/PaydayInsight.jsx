function fmt(n) {
  return `KES ${Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

export default function PaydayInsight({ data }) {
  if (!data?.payday_date) return null

  const { payday_date, payday_amount, week_spend_after, velocity_pct } = data
  const remaining = payday_amount - week_spend_after
  const isHighVelocity = velocity_pct >= 60

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Payday Spending</h2>
      <p className="text-xs text-gray-400 mb-4">How fast money goes after your biggest income day</p>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Payday</p>
            <p className="text-base font-bold text-gray-900">{fmt(payday_amount)}</p>
            <p className="text-xs text-gray-400">{payday_date}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Spent in 7 days</p>
            <p className={`text-base font-bold ${isHighVelocity ? 'text-orange-500' : 'text-gray-900'}`}>
              {fmt(week_spend_after)}
            </p>
            <p className="text-xs text-gray-400">{velocity_pct}% of income</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isHighVelocity ? 'bg-orange-400' : 'bg-[#00A86B]'}`}
              style={{ width: `${Math.min(velocity_pct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">Spent after payday</span>
            <span className="text-xs text-gray-500 font-medium">{fmt(remaining)} left</span>
          </div>
        </div>

        {isHighVelocity && (
          <p className="text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
            {velocity_pct}% of your income spent within a week of payday. Consider setting aside savings before spending.
          </p>
        )}
      </div>
    </div>
  )
}
