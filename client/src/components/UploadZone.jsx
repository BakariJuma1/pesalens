import { useState, useRef, useCallback } from 'react'
import { Upload, Lock, Shield, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react'

export default function UploadZone({ onUpload, isLoading, backendStatus }) {
  const [dragging, setDragging] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const inputRef = useRef(null)

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

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#00A86B] flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">M-Pesa Analyzer</h1>
            <p className="text-xs text-gray-500">Free & Private — No account needed</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Hero */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Understand Your Money
            </h2>
            <p className="text-gray-500 text-base">
              Upload your M-Pesa statement and get instant AI-powered insights —<br className="hidden sm:block" /> no account, no storage, no nonsense.
            </p>
          </div>

          {/* Privacy notice */}
          <div className="flex items-center justify-center gap-2 mb-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span>Your statement is never saved. Processed in memory and immediately deleted.</span>
          </div>

          {/* Backend wakeup status */}
          {backendStatus === 'waking' && (
            <div className="flex items-center justify-center gap-2 mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
              <span>Warming up the server — ready in a few seconds...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Drop zone */}
            <div
              onClick={() => !isLoading && inputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`
                relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                ${dragging ? 'border-[#00A86B] bg-emerald-50' : pendingFile ? 'border-[#00A86B] bg-emerald-50/40' : 'border-gray-200 bg-white hover:border-[#00A86B] hover:bg-emerald-50/40'}
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
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${dragging || pendingFile ? 'bg-[#00A86B]' : 'bg-gray-100'}`}>
                  <Upload className={`w-6 h-6 transition-colors ${dragging || pendingFile ? 'text-white' : 'text-gray-400'}`} />
                </div>
                {pendingFile ? (
                  <div>
                    <p className="text-[#00A86B] font-semibold text-base">{pendingFile.name}</p>
                    <p className="text-gray-400 text-xs mt-1">Tap to change file</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-800 font-medium text-base">
                      {dragging ? 'Drop your statement here' : 'Drop your M-Pesa PDF here'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">or tap to browse your files</p>
                  </div>
                )}
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                  PDF only · Max 10MB
                </span>
              </div>
            </div>

            {/* Password field */}
            <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                <KeyRound className="w-3.5 h-3.5 text-gray-400" />
                <label className="text-xs font-medium text-gray-600">
                  PDF Password <span className="text-gray-400 font-normal">(Safaricom sends this via SMS — usually your ID number)</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your ID number or statement password"
                  className="w-full pr-10 py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A86B] focus:ring-1 focus:ring-[#00A86B]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Your password is sent directly to the server only to unlock the PDF — it is never logged or stored.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!pendingFile || isLoading}
              className="w-full bg-[#00A86B] hover:bg-[#007A4D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {isLoading ? 'Analysing...' : 'Analyse My Statement'}
            </button>
          </form>

          {/* How it works */}
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { step: '1', label: 'Upload your Safaricom M-Pesa statement PDF' },
              { step: '2', label: 'AI reads and categorises every transaction' },
              { step: '3', label: 'Get instant insights — then close the tab' },
            ].map(({ step, label }) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00A86B] text-white text-sm font-bold flex items-center justify-center">
                  {step}
                </div>
                <p className="text-xs text-gray-500 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        Open source · MIT licensed · Built for Kenyans
      </footer>
    </div>
  )
}
