import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 15

function fmt(n) {
  return Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const CATEGORY_COLORS = {
  'Send Money': 'bg-blue-50 text-blue-700',
  'Pay Bill': 'bg-purple-50 text-purple-700',
  'Buy Goods': 'bg-pink-50 text-pink-700',
  'Airtime': 'bg-yellow-50 text-yellow-700',
  'Withdraw': 'bg-orange-50 text-orange-700',
  'Deposit': 'bg-teal-50 text-teal-700',
  'Money In': 'bg-emerald-50 text-emerald-700',
  'Other': 'bg-gray-50 text-gray-600',
}

export default function TransactionsTable({ transactions }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = transactions.filter((t) => {
    const q = query.toLowerCase()
    return (
      t.description?.toLowerCase().includes(q) ||
      t.ref?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.date?.includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSearch = (e) => {
    setQuery(e.target.value)
    setPage(1)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-gray-800">
          All Transactions
          <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length})</span>
        </h2>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={query}
            onChange={handleSearch}
            className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-full sm:w-56 focus:outline-none focus:border-[#00A86B] focus:ring-1 focus:ring-[#00A86B]/20"
          />
        </div>
      </div>

      {/* Table — scroll on mobile */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100">
              {['Date', 'Description', 'Category', 'Amount', 'Balance'].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 pb-2 pr-3 last:pr-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                  No transactions match your search.
                </td>
              </tr>
            ) : (
              slice.map((t, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 pr-3 text-gray-500 whitespace-nowrap text-xs">{t.date}</td>
                  <td className="py-2.5 pr-3 text-gray-700 max-w-[180px]">
                    <p className="truncate">{t.description}</p>
                    {t.ref && <p className="text-xs text-gray-400 truncate">{t.ref}</p>}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[t.category] || 'bg-gray-50 text-gray-600'}`}>
                      {t.category || 'Other'}
                    </span>
                  </td>
                  <td className={`py-2.5 pr-3 font-medium whitespace-nowrap ${t.type === 'in' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {t.type === 'in' ? '+' : '-'}{fmt(t.amount)}
                  </td>
                  <td className="py-2.5 text-gray-500 whitespace-nowrap text-xs">{fmt(t.balance)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:border-[#00A86B] hover:text-[#00A86B] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:border-[#00A86B] hover:text-[#00A86B] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
