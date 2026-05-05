function fmt(n) {
  return `KES ${Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

export default function FulizaInsight({ data }) {
  if (!data?.used) return null

  const { total_borrowed, total_repaid, net_outstanding, borrow_count } = data
  const hasOutstanding = net_outstanding > 0
  const repaidPct = total_borrowed > 0 ? Math.min(Math.round((total_repaid / total_borrowed) * 100), 100) : 0

  return (
    <div className={`bg-white rounded-xl border p-5 ${hasOutstanding ? 'border-orange-200' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-800">Fuliza Usage</h2>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          hasOutstanding ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {hasOutstanding ? 'Outstanding' : 'Cleared'}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-4">M-Pesa overdraft activity this period</p>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Borrowed</p>
          <p className="text-sm font-bold text-gray-900">{fmt(total_borrowed)}</p>
          <p className="text-xs text-gray-400">{borrow_count}x</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Repaid</p>
          <p className="text-sm font-bold text-gray-900">{fmt(total_repaid)}</p>
          <p className="text-xs text-gray-400">{repaidPct}%</p>
        </div>
        <div className={`rounded-xl p-3 ${hasOutstanding ? 'bg-orange-50' : 'bg-emerald-50'}`}>
          <p className="text-xs text-gray-500 mb-1">Outstanding</p>
          <p className={`text-sm font-bold ${hasOutstanding ? 'text-orange-600' : 'text-emerald-700'}`}>
            {fmt(net_outstanding > 0 ? net_outstanding : 0)}
          </p>
          <p className="text-xs text-gray-400">{hasOutstanding ? 'owed' : 'cleared'}</p>
        </div>
      </div>

      {total_borrowed > 0 && (
        <div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${repaidPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{repaidPct}% of Fuliza repaid</p>
        </div>
      )}

      {hasOutstanding && (
        <p className="text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 mt-3">
          {fmt(net_outstanding)} still outstanding. Fuliza charges daily fees — clear it as soon as possible.
        </p>
      )}
    </div>
  )
}
