const LABEL_COLOR = {
  Excellent:    { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', bar: 'bg-emerald-500' },
  Good:         { text: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-100',    bar: 'bg-blue-500'    },
  Fair:         { text: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-100',   bar: 'bg-amber-400'   },
  'Needs Work': { text: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-100',     bar: 'bg-red-400'     },
}

export default function HealthScore({ data }) {
  if (!data) return null
  const { score, label, components } = data
  const colors = LABEL_COLOR[label] || LABEL_COLOR['Fair']

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Financial Health Score</h2>
      <p className="text-xs text-gray-400 mb-4">Based on savings rate, balance trend, spending habits and debt</p>

      <div className={`flex items-center gap-4 rounded-xl p-4 mb-4 ${colors.bg} border ${colors.border}`}>
        <div className="flex-shrink-0">
          <p className={`text-4xl font-black ${colors.text}`}>{score}</p>
          <p className="text-xs text-gray-400 text-center">/ 100</p>
        </div>
        <div>
          <p className={`text-base font-bold ${colors.text}`}>{label}</p>
          <div className="h-2 w-32 bg-white rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full rounded-full transition-all ${colors.bar}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {components.map((c, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 font-medium">{c.label}</span>
              <span className="text-xs text-gray-500">{c.score}/{c.max_score}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
              <div
                className={`h-full rounded-full transition-all ${c.score === c.max_score ? 'bg-emerald-500' : c.score >= c.max_score / 2 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${Math.round((c.score / c.max_score) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">{c.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
