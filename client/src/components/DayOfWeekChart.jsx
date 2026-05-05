import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function fmt(n) {
  if (n >= 1000) return `KES ${(n / 1000).toFixed(1)}K`
  return `KES ${n.toFixed(0)}`
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { day, total, count } = payload[0].payload
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-800">{day}</p>
      <p className="text-gray-600">KES {Number(total).toLocaleString('en-KE', { maximumFractionDigits: 0 })}</p>
      <p className="text-gray-400 text-xs">{count} transaction{count !== 1 ? 's' : ''}</p>
    </div>
  )
}

export default function DayOfWeekChart({ data }) {
  if (!data?.length) return null

  const max = Math.max(...data.map(d => d.total))
  const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const chartData = data.map((d, i) => ({ ...d, short: SHORT[i] }))

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Spending by Day of Week</h2>
      <p className="text-xs text-gray-400 mb-4">Which days you spend the most</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">
          <XAxis
            dataKey="short"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.day}
                fill={entry.total === max ? '#00A86B' : '#e5e7eb'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 text-center mt-1">
        Highest: <span className="text-gray-700 font-medium">
          {chartData.find(d => d.total === max)?.day} ({fmt(max)})
        </span>
      </p>
    </div>
  )
}
