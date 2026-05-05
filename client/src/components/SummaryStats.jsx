function fmt(n) {
  return `KES ${Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

export default function SummaryStats({ summary }) {
  const { total_in, total_out, net, savings_rate } = summary
  const saved = net >= 0

  const stats = [
    { label: 'Money In', value: fmt(total_in), color: 'text-emerald-600' },
    { label: 'Money Out', value: fmt(total_out), color: 'text-red-500' },
    {
      label: saved ? 'Saved' : 'Overspent',
      value: fmt(Math.abs(net)),
      color: saved ? 'text-emerald-600' : 'text-orange-500',
    },
    {
      label: 'Savings Rate',
      value: `${savings_rate}%`,
      color: savings_rate >= 20 ? 'text-emerald-600' : savings_rate >= 10 ? 'text-amber-500' : 'text-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, value, color }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-1">
          <p className="text-xs text-gray-500">{label}</p>
          <p className={`text-lg font-bold ${color} leading-tight`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
