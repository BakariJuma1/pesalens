import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const COLORS = ['#00A86B', '#007A4D', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#059669', '#10b981']

function fmt(n) {
  if (n >= 1000) return `KES ${(n / 1000).toFixed(1)}K`
  return `KES ${n.toFixed(0)}`
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value, count } = payload[0].payload
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-gray-600">KES {Number(value).toLocaleString('en-KE', { maximumFractionDigits: 0 })}</p>
      <p className="text-gray-400 text-xs">{count} transaction{count !== 1 ? 's' : ''}</p>
    </div>
  )
}

export default function CategoryChart({ categories }) {
  const data = Object.entries(categories)
    .map(([name, { total, count }]) => ({ name, value: total, count }))
    .sort((a, b) => b.value - a.value)

  if (!data.length) return null

  const maxLabelLen = Math.max(...data.map((d) => d.name.length))
  const leftMargin = Math.min(maxLabelLen * 7, 110)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Spending by Category</h2>
      <ResponsiveContainer width="100%" height={data.length * 44 + 20}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: leftMargin, bottom: 0 }}
          barCategoryGap="30%"
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
            dataKey="name"
            width={leftMargin}
            tick={{ fontSize: 12, fill: '#374151' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
