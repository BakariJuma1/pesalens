import { jsPDF } from 'jspdf'

const GREEN   = [0, 168, 107]
const GRAY900 = [17, 24, 39]
const GRAY500 = [107, 114, 128]
const GRAY100 = [243, 244, 246]
const WHITE   = [255, 255, 255]

function fmt(n) {
  return `KES ${Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

function scoreColor(label) {
  return label === 'Excellent' ? [16, 185, 129]
       : label === 'Good'      ? [59, 130, 246]
       : label === 'Fair'      ? [245, 158, 11]
       :                         [239, 68, 68]
}

export function exportToPdf(data) {
  const {
    summary, categories, ai_analysis, health_score,
    top_expenses, payday_info, withdrawal_summary, fuliza_usage,
  } = data

  const doc  = new jsPDF({ unit: 'mm', format: 'a4' })
  const W    = 210
  const M    = 18
  const CW   = W - M * 2
  let   y    = 0

  doc.setFillColor(...GREEN)
  doc.rect(0, 0, W, 22, 'F')
  doc.setTextColor(...WHITE)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text('PesaLense', M, 14)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const dateStr = new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.text(`M-Pesa Statement Report · ${dateStr}`, W - M, 14, { align: 'right' })

  y = 32

  if (health_score) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GRAY900)
    doc.text('Financial Health Score', M, y)

    const sc = scoreColor(health_score.label)
    doc.setFontSize(26)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...sc)
    doc.text(String(health_score.score), M, y + 13)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY500)
    doc.text(`/ 100  ·  ${health_score.label}`, M + 17, y + 13)

    let bx = M + 55
    const compW = (CW - 55 - 2) / (health_score.components?.length || 1)
    ;(health_score.components || []).forEach((c) => {
      const pct = c.max_score > 0 ? c.score / c.max_score : 0
      doc.setFillColor(...GRAY100)
      doc.roundedRect(bx, y + 6, compW - 2, 3, 0.5, 0.5, 'F')
      if (pct > 0) {
        doc.setFillColor(...sc)
        doc.roundedRect(bx, y + 6, (compW - 2) * pct, 3, 0.5, 0.5, 'F')
      }
      doc.setFontSize(6)
      doc.setTextColor(...GRAY500)
      doc.text(c.label, bx, y + 13)
      bx += compW
    })

    y += 22
  }

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GRAY900)
  doc.text('Summary', M, y)
  y += 5

  const stats = [
    { label: 'Total Received', value: fmt(summary.total_in) },
    { label: 'Total Spent',    value: fmt(summary.total_out) },
    { label: 'Net',            value: (summary.net >= 0 ? '+' : '') + fmt(summary.net) },
    { label: 'Savings Rate',   value: `${summary.savings_rate}%` },
  ]
  const bw = (CW - 9) / 4
  stats.forEach((s, i) => {
    const bx2 = M + i * (bw + 3)
    doc.setFillColor(...GRAY100)
    doc.roundedRect(bx2, y, bw, 16, 2, 2, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY500)
    doc.text(s.label, bx2 + 3, y + 5)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GRAY900)
    doc.text(s.value, bx2 + 3, y + 12)
  })
  y += 22

  const extras = []
  if (withdrawal_summary?.total_withdrawn > 0)
    extras.push({ label: 'Cash Withdrawn', value: fmt(withdrawal_summary.total_withdrawn) })
  if (payday_info?.payday_amount)
    extras.push({ label: 'Payday Amount', value: fmt(payday_info.payday_amount) })
  if (payday_info?.velocity_pct)
    extras.push({ label: 'Payday Velocity', value: `${payday_info.velocity_pct}% in 7d` })
  if (fuliza_usage?.used)
    extras.push({ label: 'Fuliza Borrowed', value: fmt(fuliza_usage.total_borrowed) })

  if (extras.length) {
    const ew = (CW - (extras.length - 1) * 3) / extras.length
    extras.forEach((e, i) => {
      const ex = M + i * (ew + 3)
      doc.setFillColor(...GRAY100)
      doc.roundedRect(ex, y, ew, 14, 2, 2, 'F')
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...GRAY500)
      doc.text(e.label, ex + 3, y + 5)
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...GRAY900)
      doc.text(e.value, ex + 3, y + 11)
    })
    y += 20
  }

  if (categories && Object.keys(categories).length) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GRAY900)
    doc.text('Spending by Category', M, y)
    y += 5

    const sorted = Object.entries(categories)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 7)
    const maxAmt = sorted[0]?.[1].total || 1
    const totalOut = summary.total_out || 1

    sorted.forEach(([cat, d]) => {
      const pct    = Math.round((d.total / totalOut) * 100)
      const barLen = Math.round((d.total / maxAmt) * (CW - 52))

      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...GRAY900)
      doc.text(cat, M, y + 3)

      doc.setFillColor(...GRAY100)
      doc.roundedRect(M + 40, y, CW - 52, 5, 1, 1, 'F')
      if (barLen > 0) {
        doc.setFillColor(...GREEN)
        doc.roundedRect(M + 40, y, barLen, 5, 1, 1, 'F')
      }

      doc.setFontSize(7)
      doc.setTextColor(...GRAY500)
      doc.text(`${fmt(d.total)}  (${pct}%)`, W - M, y + 3.5, { align: 'right' })

      y += 8
    })
    y += 4
  }

  if (ai_analysis) {
    if (y > 220) { doc.addPage(); y = 20 }

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GRAY900)
    doc.text('AI Analysis', M, y)
    y += 5

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY500)
    const lines = doc.splitTextToSize(ai_analysis, CW)
    const cap   = Math.min(lines.length, 22)
    doc.text(lines.slice(0, cap), M, y)
    y += cap * 4.2 + 6
  }

  if (top_expenses?.length) {
    if (y > 240) { doc.addPage(); y = 20 }

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GRAY900)
    doc.text('Top Expenses', M, y)
    y += 5

    top_expenses.forEach((e) => {
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...GRAY900)
      doc.text(e.description.slice(0, 55), M, y + 3)
      doc.setTextColor(...GRAY500)
      doc.text(`${fmt(e.amount)}  ·  ${e.date}`, W - M, y + 3, { align: 'right' })
      y += 6
    })
  }

  const pages = doc.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    doc.setDrawColor(...GRAY100)
    doc.line(M, 286, W - M, 286)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY500)
    doc.text(
      'Generated by PesaLense · Data processed in memory only, never stored',
      W / 2, 291, { align: 'center' },
    )
    if (pages > 1) doc.text(`${p} / ${pages}`, W - M, 291, { align: 'right' })
  }

  const filename = `pesalense-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
