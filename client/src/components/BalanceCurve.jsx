import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="font-semibold text-gray-800">
        KES {Number(payload[0].value).toLocaleString('en-KE', { maximumFractionDigits: 0 })}
      </p>
    </div>
  )
}

export default function BalanceCurve({ data }) {
  if (!data?.length) return null

  // Sample down to max 60 points for readability
  const step = Math.max(1, Math.floor(data.length / 60))
  const sampled = data.filter((_, i) => i % step === 0 || i === data.length - 1)

  const values = sampled.map(d => d.balance)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const trend = values[values.length - 1] >= values[0] ? 'up' : 'down'

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-800">M-Pesa Balance Over Time</h2>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
        }`}>
          {trend === 'up' ? 'Growing' : 'Declining'}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Low: KES {min.toLocaleString('en-KE', { maximumFractionDigits: 0 })} &nbsp;·&nbsp;
        High: KES {max.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={sampled} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#00A86B" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#00A86B"
            strokeWidth={2}
            fill="url(#balanceGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
