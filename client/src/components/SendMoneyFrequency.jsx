function fmt(n) {
  return `KES ${Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

export default function SendMoneyFrequency({ data }) {
  if (!data?.length) return null

  const maxCount = Math.max(...data.map(d => d.count))

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Frequent Recipients</h2>
      <p className="text-xs text-gray-400 mb-4">People you send money to most often</p>

      <div className="flex flex-col gap-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-gray-500">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-700 truncate">{item.name}</p>
                <p className="text-xs text-gray-500 flex-shrink-0 ml-2">{item.count}x</p>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.round((item.count / maxCount) * 100)}%` }}
                />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-900 flex-shrink-0">{fmt(item.total)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
