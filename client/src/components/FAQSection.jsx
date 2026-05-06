import { useState } from 'react'

const FAQS = [
  {
    q: "Is my M-Pesa statement safe?",
    a: "Yes, completely. Your PDF is processed in memory on the server and immediately discarded after analysis. Nothing is written to disk, no database exists, no logs contain your data. Once you close the tab, every trace is gone.",
  },
  {
    q: "What is the PDF password?",
    a: "Safaricom encrypts every statement PDF. When you request a statement via MySafaricom app or email, they send you a separate SMS with the password. Check your SMS inbox for a message from Safaricom with the PDF password.",
  },
  {
    q: "How do I get my M-Pesa statement?",
    a: "Open the MySafaricom app, go to M-Pesa, then M-Pesa Statement, choose a date range and request via email. You will receive the PDF within minutes. Alternatively dial *334# and follow the prompts.",
  },
  {
    q: "How many months of transactions can I upload?",
    a: "You can upload up to 6 months at a time (Safaricom's maximum). We tested on a 41-page statement with 1,387 transactions and it handled it fine.",
  },
  {
    q: "Is this really free?",
    a: "Yes, free forever. No subscription, no freemium tier, no upsell. The goal is to be useful, not profitable.",
  },
  {
    q: "Does it work on my phone?",
    a: "Yes. The app is designed mobile-first. Most Kenyans access the internet on a phone, so every screen is optimised for small displays. You can share your summary card directly to WhatsApp from your phone.",
  },
  {
    q: "Can I share my results?",
    a: "Yes. After analysis loads, tap Share My Month to generate a summary card showing your key stats. On mobile it opens the native share sheet (WhatsApp, Twitter, etc). On desktop it downloads as a PNG.",
  },
  {
    q: "What if the AI analysis doesn't appear?",
    a: "The AI analysis uses Groq. Occasionally the free API is briefly rate-limited. The app will retry automatically. If it still doesn't appear, wait a minute and re-upload.",
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
        <span className="text-gray-400 flex-shrink-0 text-base font-medium leading-none">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white">
          <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Frequently asked questions</h2>
        <p className="text-gray-400 text-sm text-center mb-8">Everything you need to know before uploading.</p>
        <div className="flex flex-col gap-2">
          {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
        </div>
      </div>
    </section>
  )
}
