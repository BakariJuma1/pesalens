import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'

const MESSAGES = [
  'Reading your statement...',
  'Crunching the numbers...',
  'Asking AI...',
  'Almost there...',
]

export default function LoadingState() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1 < MESSAGES.length ? i + 1 : i))
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6">
        {/* Pulsing icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#00A86B]/10 animate-ping absolute inset-0" />
          <div className="relative w-20 h-20 rounded-full bg-[#00A86B] flex items-center justify-center">
            <Shield className="w-9 h-9 text-white" />
          </div>
        </div>

        {/* Spinner dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-[#00A86B] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <p className="text-gray-700 font-medium text-lg text-center transition-all duration-500">
          {MESSAGES[msgIndex]}
        </p>
        <p className="text-gray-400 text-sm text-center">
          Your data never leaves this session — processed in memory only.
        </p>
      </div>
    </div>
  )
}
