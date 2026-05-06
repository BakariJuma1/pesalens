import { useState, useRef, useCallback } from 'react'
import FAQSection from './FAQSection'

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="9" stroke="#00A86B" strokeWidth="2.5" />
      <path d="M21 21L30 30" stroke="#00A86B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M11 14h6M14 11v6" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function UploadZone({ onUpload, isLoading, backendStatus }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const inputRef = useRef(null)
  const uploadRef = useRef(null)

  const handleFile = useCallback((file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert("Please upload a PDF file, your M-Pesa statement from Safaricom.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.")
      return
    }
    setPendingFile(file)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pendingFile) onUpload(pendingFile, password)
  }

  const scrollToUpload = () =>
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <nav className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-bold text-gray-900 text-sm tracking-tight">PesaLense</span>
          </div>
          <button
            onClick={scrollToUpload}
            className="bg-[#00A86B] hover:bg-[#007A4D] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
          >
            Analyse Statement
          </button>
        </div>
      </nav>

      <section className="bg-white pt-14 pb-10 px-4 border-b border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold text-[#00A86B] mb-5 uppercase tracking-widest">
            Free · Private · No account needed
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Understand Your<br />
            <span className="text-[#00A86B]">M-Pesa Money</span>
          </h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto mb-10">
            Upload your Safaricom statement and get instant AI-powered insights, charts, spending breakdown, and plain-English advice. No account. Nothing saved.
          </p>

          <div ref={uploadRef} className="bg-white rounded-2xl border border-gray-200 p-6 text-left max-w-xl mx-auto">
            {backendStatus === 'waking' && (
              <div className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Warming up the server, ready in a few seconds...
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">M-Pesa Statement PDF</label>
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => !isLoading && inputRef.current?.click()}
                    disabled={isLoading}
                    className="flex-shrink-0 text-xs font-semibold text-white bg-[#00A86B] hover:bg-[#007A4D] disabled:opacity-50 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    Choose file
                  </button>
                  <span className="text-sm text-gray-500 truncate min-w-0">
                    {pendingFile ? pendingFile.name : 'No file selected'}
                  </span>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">
                  PDF Password{' '}
                  <span className="text-gray-400 font-normal">(sent by Safaricom via SMS when you requested the statement)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your ID number or statement password"
                    className="w-full pr-16 py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#00A86B] focus:ring-1 focus:ring-[#00A86B]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Your password is used only to unlock the PDF. Never logged or stored.
                </p>
              </div>

              <button
                type="submit"
                disabled={!pendingFile || isLoading}
                className="w-full bg-[#00A86B] hover:bg-[#007A4D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {isLoading ? 'Analysing...' : 'Analyse My Statement'}
              </button>
            </form>

            <p className="text-center mt-3 text-xs text-gray-400">
              Your statement is never saved. Processed in memory and immediately deleted.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Everything you need to understand your money</h2>
          <p className="text-gray-400 text-center text-sm mb-10">No fintech jargon. No sign-up. Just honest answers about where your money goes.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                num: '01',
                title: 'AI Analysis',
                desc: 'Gemini AI reads your transactions and writes a plain-English summary, like advice from a financially savvy Kenyan friend.',
              },
              {
                num: '02',
                title: 'Visual Breakdowns',
                desc: 'Bar charts show spending by category and monthly trends. Readable on any screen size.',
              },
              {
                num: '03',
                title: 'Total Privacy',
                desc: 'No database, no accounts, no cookies. Your PDF is processed in memory only. Close the tab and nothing exists anywhere.',
              },
              {
                num: '04',
                title: 'Shareable Card',
                desc: 'Generate a summary card to share on WhatsApp, Twitter, or Instagram. Created entirely on your device.',
              },
              {
                num: '05',
                title: 'Mobile First',
                desc: 'Designed for the phone in your pocket. Every screen works perfectly on small displays.',
              },
              {
                num: '06',
                title: 'Instant Results',
                desc: 'Upload your PDF and get your full analysis in under 60 seconds. Handles 6-month statements with 1,000+ transactions.',
              },
            ].map(({ num, title, desc }) => (
              <div key={num} className="border border-gray-100 rounded-xl p-5 flex flex-col gap-3">
                <span className="text-2xl font-extrabold text-gray-100">{num}</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How it works</h2>
          <p className="text-gray-400 text-sm mb-10">Three steps. Under a minute. Nothing saved.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Get your statement',
                desc: 'Open MySafaricom, go to M-Pesa Statement, choose a date range and request via email. Safaricom sends the PDF and your password via SMS.',
              },
              {
                step: '2',
                title: 'Upload and unlock',
                desc: 'Choose your PDF and enter the password from the SMS sent by Safaricom. Tap Analyse.',
              },
              {
                step: '3',
                title: 'Understand your money',
                desc: 'Get an instant breakdown: AI summary, charts, top expenses. Share your monthly card on WhatsApp or close the tab.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[#00A86B] text-white text-lg font-bold flex items-center justify-center">
                  {step}
                </div>
                <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={scrollToUpload}
            className="mt-10 bg-[#00A86B] hover:bg-[#007A4D] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Get started, it's free
          </button>
        </div>
      </section>

      <FAQSection />

      <footer className="bg-gray-50 border-t border-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-semibold text-gray-700">PesaLense</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Free forever · Built for Kenyans · Processed in memory only
          </p>
        </div>
      </footer>
    </div>
  )
}
