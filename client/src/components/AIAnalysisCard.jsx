import { Sparkles } from 'lucide-react'

export default function AIAnalysisCard({ analysis, parseMethod }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[#00A86B]/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#00A86B]" />
        </div>
        <h2 className="text-sm font-semibold text-gray-800">AI Analysis</h2>
        {parseMethod === 'ai' && (
          <span className="ml-auto text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
            Some transactions may not have been read perfectly — check the table below.
          </span>
        )}
      </div>
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{analysis}</p>
    </div>
  )
}
