import { useRef } from 'react'
import html2canvas from 'html2canvas'

function fmt(n) {
  return `KES ${Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

function getMonthRange(monthly) {
  const months = Object.keys(monthly).sort()
  if (!months.length) return 'Your M-Pesa Statement'
  if (months.length === 1) return months[0]
  return `${months[0]} to ${months[months.length - 1]}`
}

function topCategory(categories) {
  if (!Object.keys(categories).length) return null
  const [name, { total }] = Object.entries(categories).sort((a, b) => b[1].total - a[1].total)[0]
  return { name, total }
}

export default function ShareCardModal({ data, onClose }) {
  const cardRef = useRef(null)
  const { summary, categories, monthly } = data
  const { total_in, total_out, net, savings_rate } = summary
  const saved = net >= 0
  const top = topCategory(categories)
  const monthRange = getMonthRange(monthly)
  const barWidth = Math.max(5, Math.min(95, savings_rate))

  const downloadPng = async () => {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    })
    const link = document.createElement('a')
    link.download = 'mpesa-summary.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const shareCard = async () => {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true })
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'mpesa-summary.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My M-Pesa Summary',
          text: 'Check out my M-Pesa spending breakdown, analysed for free at PesaLense.',
          files: [file],
        })
      } else {
        downloadPng()
      }
    })
  }

  const copyLink = () => {
    navigator.clipboard.writeText('https://mpesa-analyzer.vercel.app')
      .then(() => alert('Link copied!'))
      .catch(() => {})
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Share My Month</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 text-lg leading-none">
            &times;
          </button>
        </div>

        <div className="p-4 flex justify-center bg-gray-50">
          <div
            ref={cardRef}
            style={{
              width: 360,
              height: 360,
              background: 'linear-gradient(135deg, #00A86B 0%, #007A4D 100%)',
              borderRadius: 20,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', right: -40, top: -40,
              width: 180, height: 180, borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
            }} />
            <div style={{
              position: 'absolute', right: 20, bottom: -60,
              width: 140, height: 140, borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
            }} />

            <div>
              <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600, marginBottom: 16, letterSpacing: 1 }}>
                PESALENSE
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{monthRange}</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>M-Pesa Statement Summary</div>
            </div>

            <div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, opacity: 0.75, marginBottom: 3 }}>MONEY IN</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{fmt(total_in)}</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, opacity: 0.75, marginBottom: 3 }}>MONEY OUT</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{fmt(total_out)}</div>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11, opacity: 0.85 }}>
                  <span>Savings Rate</span>
                  <span style={{ fontWeight: 700 }}>{savings_rate}% {saved ? '✓' : ''}</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${barWidth}%`, background: '#ffffff', borderRadius: 3 }} />
                </div>
              </div>

              {top && (
                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>BIGGEST SPEND</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{top.name}: {fmt(top.total)}</div>
                </div>
              )}
            </div>

            <div style={{ fontSize: 10, opacity: 0.6, textAlign: 'center' }}>
              pesalense.vercel.app · Free and Private
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-2">
          <button
            onClick={shareCard}
            className="w-full bg-[#00A86B] hover:bg-[#007A4D] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
          >
            Share now
          </button>
          <div className="flex gap-2">
            <button
              onClick={downloadPng}
              className="flex-1 border border-gray-200 text-gray-700 hover:border-gray-300 font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              Download PNG
            </button>
            <button
              onClick={copyLink}
              className="flex-1 border border-gray-200 text-gray-700 hover:border-gray-300 font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              Copy link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
