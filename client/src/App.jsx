import { useState, useEffect } from 'react'
import './index.css'
import UploadZone from './components/UploadZone'
import LoadingState from './components/LoadingState'
import Dashboard from './components/Dashboard'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export default function App() {
  const [view, setView] = useState('upload')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [backendStatus, setBackendStatus] = useState('waking')

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${API_BASE}/health`, { signal: controller.signal })
      .then((r) => { if (r.ok) setBackendStatus('ready') })
      .catch(() => setBackendStatus('ready')) // still allow upload on error
    return () => controller.abort()
  }, [])

  const handleUpload = async (file, password = '') => {
    setError(null)
    setView('loading')

    const formData = new FormData()
    formData.append('file', file)
    if (password) formData.append('password', password)

    try {
      const res = await fetch(`${API_BASE}/analyze`, { method: 'POST', body: formData })

      if (res.status === 429) {
        throw new Error('Slow down. Try again in an hour.')
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || "We couldn't read this file. Make sure it's an M-Pesa PDF from Safaricom.")
      }

      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Something went wrong analysing your statement.')
      }

      setData(json)
      setView('results')
    } catch (err) {
      setError(err.message)
      setView('upload')
    }
  }

  const handleReset = () => {
    setData(null)
    setError(null)
    setView('upload')
  }

  if (view === 'loading') return <LoadingState />
  if (view === 'results' && data) return <Dashboard data={data} onReset={handleReset} />

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 shadow-lg max-w-sm w-full mx-4 text-center">
          {error}
        </div>
      )}
      <UploadZone onUpload={handleUpload} isLoading={false} backendStatus={backendStatus} />
    </>
  )
}
