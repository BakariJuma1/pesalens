function fmt(n) {
  return `KES ${Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

export default function RecurringPayments({ data }) {
  if (!data?.length) return null

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Recurring Payments</h2>
      <p className="text-xs text-gray-400 mb-4">Bills and payments that repeat across months</p>
      <div className="flex flex-col gap-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-gray-700 truncate">{item.description}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {item.count} times across {item.months} month{item.months !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-gray-900">{fmt(item.avg_amount)}<span className="text-gray-400 font-normal">/avg</span></p>
              <p className="text-xs text-gray-400">{fmt(item.total)} total</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
