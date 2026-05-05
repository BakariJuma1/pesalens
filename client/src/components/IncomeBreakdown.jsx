function fmt(n) {
  return `KES ${Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

export default function IncomeBreakdown({ data, totalIn }) {
  if (!data?.length) return null

  const max = Math.max(...data.map(d => d.total))

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Income Sources</h2>
      <p className="text-xs text-gray-400 mb-4">Where your money came from this period</p>

      <div className="flex flex-col gap-3">
        {data.map((source, i) => {
          const pct = totalIn > 0 ? Math.round((source.total / totalIn) * 100) : 0
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 truncate">{source.name}</p>
                  <p className="text-xs text-gray-400">{source.count} transfer{source.count !== 1 ? 's' : ''} · {pct}%</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 flex-shrink-0 ml-3">{fmt(source.total)}</p>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00A86B] rounded-full transition-all"
                  style={{ width: `${Math.round((source.total / max) * 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
