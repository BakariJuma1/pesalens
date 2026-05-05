export default function AIAnalysisCard({ analysis, parseMethod }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800">AI Analysis</h2>
        {parseMethod === 'ai' && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
            Some transactions may not have been read perfectly. Check the table below.
          </span>
        )}
      </div>
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{analysis}</p>
    </div>
  )
}
