import { TrendingUp, TrendingDown, Activity, PiggyBank } from 'lucide-react'

function fmt(n) {
  return `KES ${Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

export default function SummaryStats({ summary }) {
  const { total_in, total_out, net, savings_rate } = summary
  const saved = net >= 0

  const stats = [
    {
      label: 'Money In',
      value: fmt(total_in),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Money Out',
      value: fmt(total_out),
      icon: TrendingDown,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      label: saved ? 'Saved' : 'Overspent',
      value: fmt(Math.abs(net)),
      icon: Activity,
      color: saved ? 'text-emerald-600' : 'text-orange-500',
      bg: saved ? 'bg-emerald-50' : 'bg-orange-50',
    },
    {
      label: 'Savings Rate',
      value: `${savings_rate}%`,
      icon: PiggyBank,
      color: savings_rate >= 20 ? 'text-emerald-600' : savings_rate >= 10 ? 'text-amber-500' : 'text-red-500',
      bg: savings_rate >= 20 ? 'bg-emerald-50' : savings_rate >= 10 ? 'bg-amber-50' : 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-2">
          <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className={`text-lg font-bold ${color} leading-tight`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
