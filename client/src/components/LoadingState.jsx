import { useEffect, useState } from 'react'

const MESSAGES = [
  'Reading your statement...',
  'Crunching the numbers...',
  'Asking AI...',
  'Almost there...',
]

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="9" stroke="#00A86B" strokeWidth="2.5" />
      <path d="M21 21L30 30" stroke="#00A86B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M11 14h6M14 11v6" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function LoadingState() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1 < MESSAGES.length ? i + 1 : i))
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
          <Logo />
          <span className="font-bold text-gray-900 text-sm tracking-tight">PesaLense</span>
        </div>
      </nav>

      {/* Loading content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-[#00A86B] animate-spin" />
          <p className="text-gray-700 font-medium text-lg text-center">
            {MESSAGES[msgIndex]}
          </p>
          <p className="text-gray-400 text-sm text-center">
            Your data never leaves this session. Processed in memory only.
          </p>
          <p className="text-xs text-gray-300 text-center max-w-xs">
            We're on the free tier. First run after inactivity can take up to 60 seconds.
          </p>
        </div>
      </div>
    </div>
  )
}
