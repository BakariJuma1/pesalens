import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

function fmt(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return `${n.toFixed(0)}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: KES {Number(p.value).toLocaleString('en-KE', { maximumFractionDigits: 0 })}
        </p>
      ))}
    </div>
  )
}

export default function MonthlyChart({ monthly }) {
  const data = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { total_in, total_out }]) => ({
      month,
      'Money In': total_in,
      'Money Out': total_out,
    }))

  if (!data.length) return null

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Monthly Money In vs Out</h2>
      <ResponsiveContainer width="100%" height={data.length * 56 + 40}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 80, bottom: 0 }}
          barCategoryGap="25%"
          barGap={3}
        >
          <XAxis
            type="number"
            tickFormatter={fmt}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="month"
            width={76}
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Money In" fill="#00A86B" radius={[0, 4, 4, 0]} />
          <Bar dataKey="Money Out" fill="#f87171" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
