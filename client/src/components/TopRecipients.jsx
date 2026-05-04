import { Users } from 'lucide-react'

export default function TopRecipients({ recipients }) {
  if (!recipients || recipients.length === 0) return null

  const max = recipients[0].total

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Users className="w-4 h-4 text-emerald-600" />
        </div>
        <h2 className="font-semibold text-gray-900 text-sm">Who You Send Money To Most</h2>
      </div>

      <div className="flex flex-col gap-3">
        {recipients.map((r, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-medium text-gray-400 w-4 shrink-0">{i + 1}</span>
                <span className="text-sm font-medium text-gray-800 truncate">{r.name}</span>
              </div>
              <div className="flex flex-col items-end ml-3 shrink-0">
                <span className="text-sm font-semibold text-gray-900">
                  KES {r.total.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-gray-400">{r.count} {r.count === 1 ? 'time' : 'times'}</span>
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(r.total / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
