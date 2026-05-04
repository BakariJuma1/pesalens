import { useState, useRef, useCallback } from 'react'
import {
  Upload, Lock, Shield, Loader2, KeyRound, Eye, EyeOff,
  Sparkles, BarChart2, Smartphone, Code2, ChevronDown, ChevronUp,
  Share2, FileCheck, Zap,
} from 'lucide-react'

const FAQS = [
  {
    q: "Is my M-Pesa statement safe?",
    a: "Yes — completely. Your PDF is processed in memory on the server and immediately discarded after analysis. Nothing is written to disk, no database exists, no logs contain your data. Once you close the tab, every trace is gone.",
  },
  {
    q: "What is the PDF password?",
    a: "Safaricom encrypts every statement PDF. When you request a statement via MySafaricom app or email, they send you a separate SMS with the password — it is usually your national ID number. Enter that in the password field.",
  },
  {
    q: "How do I get my M-Pesa statement?",
    a: "Open the MySafaricom app → M-Pesa → M-Pesa Statement → choose a date range → request via email. You'll receive the PDF within minutes. Alternatively dial *334# and follow the prompts.",
  },
  {
    q: "How many months of transactions can I upload?",
    a: "You can upload up to 6 months at a time (Safaricom's maximum). We tested on a 41-page statement with 1,387 transactions — it handled it fine.",
  },
  {
    q: "Is this really free?",
    a: "Yes, free forever. No subscription, no freemium tier, no upsell. This is an open-source portfolio project — the goal is to be useful, not profitable.",
  },
  {
    q: "Does it work on my phone?",
    a: "Yes — the app is designed mobile-first. Most Kenyans access the internet on a phone, so every screen is optimised for small displays. You can even share your summary card directly to WhatsApp from your phone.",
  },
  {
    q: "Can I share my results?",
    a: "Yes. After analysis loads, tap 'Share My Month' to generate a beautiful summary card showing your key stats. On mobile it opens the native share sheet (WhatsApp, Twitter, etc). On desktop it downloads as a PNG.",
  },
  {
    q: "What if the AI analysis doesn't appear?",
    a: "The AI analysis uses Google Gemini. Occasionally the free API is briefly rate-limited — the app will retry automatically. If it still doesn't appear, wait a minute and re-upload.",
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors gap-4"
      >
        <span className="text-sm font-medium text-gray-800">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white">
          <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function UploadZone({ onUpload, isLoading, backendStatus }) {
  const [dragging, setDragging] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const inputRef = useRef(null)
  const uploadRef = useRef(null)

  const handleFile = useCallback((file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert("Please upload a PDF file — your M-Pesa statement from Safaricom.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.")
      return
    }
    setPendingFile(file)
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pendingFile) onUpload(pendingFile, password)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const scrollToUpload = () =>
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00A86B] flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">M-Pesa Analyzer</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/BakariJuma1/pesalens"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              <Code2 className="w-4 h-4" />
              GitHub
            </a>
            <button
              onClick={scrollToUpload}
              className="bg-[#00A86B] hover:bg-[#007A4D] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
            >
              Analyse My Statement
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-emerald-50/60 to-white pt-14 pb-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Lock className="w-3 h-3" />
            Free · Private · No account needed
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Understand Your<br />
            <span className="text-[#00A86B]">M-Pesa Money</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-lg mx-auto mb-8">
            Upload your Safaricom statement and get instant AI-powered insights — charts, spending breakdown, and plain-English advice. No account. Nothing saved.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10 text-xs text-gray-400">
            {['Zero data stored', 'Open source', 'Works on mobile', 'Free forever'].map(b => (
              <span key={b} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A86B]" />{b}
              </span>
            ))}
          </div>

          {/* ── Upload form ── */}
          <div ref={uploadRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left max-w-xl mx-auto">
            {backendStatus === 'waking' && (
              <div className="flex items-center gap-2 mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                <span>Warming up the server — ready in a few seconds...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Drop zone */}
              <div
                onClick={() => !isLoading && inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                  ${dragging ? 'border-[#00A86B] bg-emerald-50' : pendingFile ? 'border-[#00A86B] bg-emerald-50/40' : 'border-gray-200 hover:border-[#00A86B] hover:bg-emerald-50/30'}
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                  disabled={isLoading}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${dragging || pendingFile ? 'bg-[#00A86B]' : 'bg-gray-100'}`}>
                    {pendingFile
                      ? <FileCheck className={`w-5 h-5 ${pendingFile ? 'text-white' : 'text-gray-400'}`} />
                      : <Upload className={`w-5 h-5 ${dragging ? 'text-white' : 'text-gray-400'}`} />
                    }
                  </div>
                  {pendingFile ? (
                    <div>
                      <p className="text-[#00A86B] font-semibold text-sm">{pendingFile.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">Tap to change file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 font-medium text-sm">Drop your M-Pesa PDF here</p>
                      <p className="text-gray-400 text-xs mt-0.5">or tap to browse · PDF only · Max 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-gray-400" />
                  <label className="text-xs font-medium text-gray-600">
                    PDF Password <span className="text-gray-400 font-normal">(usually your ID number — sent by Safaricom via SMS)</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your ID number or statement password"
                    className="w-full pr-10 py-2 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#00A86B] focus:ring-1 focus:ring-[#00A86B]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Your password is used only to unlock the PDF — never logged or stored.
                </p>
              </div>

              <button
                type="submit"
                disabled={!pendingFile || isLoading}
                className="w-full bg-[#00A86B] hover:bg-[#007A4D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {isLoading ? 'Analysing...' : 'Analyse My Statement →'}
              </button>
            </form>

            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-emerald-600">
              <Lock className="w-3 h-3" />
              Your statement is never saved — processed in memory and immediately deleted.
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Everything you need to understand your money</h2>
          <p className="text-gray-400 text-center text-sm mb-10">No fintech jargon. No sign-up. Just honest answers about where your money goes.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Sparkles, color: 'bg-purple-50 text-purple-600',
                title: 'AI-Powered Analysis',
                desc: 'Gemini AI reads your transactions and writes a plain-English summary — like advice from a financially savvy Kenyan friend.',
              },
              {
                icon: BarChart2, color: 'bg-blue-50 text-blue-600',
                title: 'Visual Breakdowns',
                desc: 'Horizontal bar charts show spending by category and monthly trends. No confusing pie charts — bars are readable on any screen size.',
              },
              {
                icon: Lock, color: 'bg-emerald-50 text-emerald-600',
                title: 'Total Privacy',
                desc: 'No database, no accounts, no cookies. Your PDF is processed in memory only. Close the tab and nothing exists anywhere.',
              },
              {
                icon: Share2, color: 'bg-pink-50 text-pink-600',
                title: 'Shareable Card',
                desc: 'Generate a beautiful 1080×1080 summary card to post on WhatsApp, Twitter, or Instagram. Created entirely on your device.',
              },
              {
                icon: Smartphone, color: 'bg-amber-50 text-amber-600',
                title: 'Mobile First',
                desc: 'Designed for the phone in your pocket. Every screen — upload, charts, share — works perfectly on small displays.',
              },
              {
                icon: Zap, color: 'bg-orange-50 text-orange-600',
                title: 'Instant Results',
                desc: 'Upload your PDF, get your full analysis in under 60 seconds. Handles 6-month statements with 1,000+ transactions.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-gray-50 rounded-xl p-5 flex flex-col gap-3">
                <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How it works</h2>
          <p className="text-gray-400 text-sm mb-10">Three steps. Under a minute. Nothing saved.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Get your statement',
                desc: 'Open MySafaricom → M-Pesa → M-Pesa Statement. Request via email. Safaricom sends the PDF + your password via SMS.',
              },
              {
                step: '2',
                title: 'Upload & unlock',
                desc: 'Drop your PDF here and enter the password from the SMS (usually your ID number). Tap Analyse.',
              },
              {
                step: '3',
                title: 'Understand your money',
                desc: 'Get an instant breakdown — AI summary, charts, top expenses. Share your monthly card on WhatsApp or close the tab.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[#00A86B] text-white text-lg font-bold flex items-center justify-center shadow-lg shadow-emerald-100">
                  {step}
                </div>
                <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={scrollToUpload}
            className="mt-10 inline-flex items-center gap-2 bg-[#00A86B] hover:bg-[#007A4D] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            Get started — it's free
          </button>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Frequently asked questions</h2>
          <p className="text-gray-400 text-sm text-center mb-8">Everything you need to know before uploading.</p>
          <div className="flex flex-col gap-2">
            {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#00A86B] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">M-Pesa Analyzer</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Open source · MIT licensed · Built for Kenyans · Free forever
          </p>
          <a
            href="https://github.com/BakariJuma1/pesalens"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Code2 className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
