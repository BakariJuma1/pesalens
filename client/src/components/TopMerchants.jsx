function fmt(n) {
  return `KES ${Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

export default function TopMerchants({ data }) {
  if (!data?.length) return null

  const max = Math.max(...data.map(d => d.total))

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Top Merchants</h2>
      <p className="text-xs text-gray-400 mb-4">PayBill and Buy Goods payments by total spent</p>

      <div className="flex flex-col gap-3">
        {data.map((merchant, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <div className="min-w-0">
                <p className="text-sm text-gray-700 truncate">{merchant.name}</p>
                <p className="text-xs text-gray-400">{merchant.count} payment{merchant.count !== 1 ? 's' : ''}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 flex-shrink-0 ml-3">{fmt(merchant.total)}</p>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00A86B] rounded-full transition-all"
                style={{ width: `${Math.round((merchant.total / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
