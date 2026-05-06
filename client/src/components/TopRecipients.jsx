import { useState } from 'react'

function RecipientList({ items }) {
  if (!items?.length) return (
    <p className="text-xs text-gray-400 py-4 text-center">No transactions found</p>
  )

  const max = items[0].total

  return (
    <div className="flex flex-col gap-3">
      {items.map((r, i) => (
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
  )
}

export default function TopRecipients({ recipients, pochiRecipients }) {
  const [tab, setTab] = useState('direct')

  const hasDirect = recipients?.length > 0
  const hasPochi  = pochiRecipients?.length > 0

  if (!hasDirect && !hasPochi) return null

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Who You Send Money To Most</h2>

      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setTab('direct')}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
            tab === 'direct' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Direct Sends
        </button>
        <button
          onClick={() => setTab('pochi')}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
            tab === 'pochi' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pochi La Biashara
        </button>
      </div>

      {tab === 'direct'
        ? <RecipientList items={recipients} />
        : <RecipientList items={pochiRecipients} />
      }
    </div>
  )
}
