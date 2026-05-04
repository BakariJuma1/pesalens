import { ArrowUpRight } from 'lucide-react'

function fmt(n) {
  return `KES ${Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

export default function TopExpenses({ expenses }) {
  if (!expenses?.length) return null

  const max = expenses[0]?.amount || 1

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <ArrowUpRight className="w-4 h-4 text-red-400" />
        <h2 className="text-sm font-semibold text-gray-800">Top 5 Expenses</h2>
      </div>
      <ol className="flex flex-col gap-3">
        {expenses.map((exp, i) => (
          <li key={i} className="flex flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <span className="text-xs font-bold text-gray-300 w-4 flex-shrink-0 mt-0.5">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 truncate">{exp.description}</p>
                  {exp.date && <p className="text-xs text-gray-400">{exp.date}</p>}
                </div>
              </div>
              <span className="text-sm font-semibold text-red-500 flex-shrink-0">{fmt(exp.amount)}</span>
            </div>
            <div className="ml-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full"
                style={{ width: `${(exp.amount / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
