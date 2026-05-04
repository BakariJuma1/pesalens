# M-Pesa Analyzer

**Understand Your Money — No Account, No Storage, No Nonsense**

M-Pesa Analyzer is a free, open-source web app that turns your Safaricom M-Pesa PDF statement into instant, AI-powered spending insights. Upload your statement, get a clear breakdown of where your money went, then close the tab. Nothing is ever saved.

> Built by a Kenyan dev, for Kenyan users. Free forever. MIT licensed.

---

## Features

- **Drag-and-drop PDF upload** — supports all standard Safaricom M-Pesa statement formats
- **AI-powered analysis** — plain-English spending summary from Gemini 1.5 Flash, written like advice from a trusted Kenyan friend
- **Spending breakdown** — horizontal bar charts by category (Send Money, Pay Bill, Buy Goods, Airtime, Withdraw, Deposit, and more)
- **Monthly trends** — money in vs. money out across every month in the statement
- **Top 5 expenses** — your biggest outgoing transactions at a glance
- **Full transactions table** — paginated, searchable, with category badges
- **Shareable summary card** — a beautiful 1080×1080 image card you can post to WhatsApp, Twitter/X, or Instagram. Generated entirely client-side — nothing is uploaded
- **Mobile-first** — designed for phones, where most Kenyans access the internet
- **Zero data retention** — your PDF is processed in memory only and immediately discarded after analysis

---

## Privacy

This app has no database, no file storage, no cookies, no analytics, and no user accounts. Your M-Pesa statement never touches a disk. IP addresses are used only for rate limiting (5 requests/hour) and are not logged. Once your browser tab closes, there is no trace of your data anywhere.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS, Recharts, html2canvas, Lucide React |
| Backend | Flask, Marshmallow, pdfplumber, Flask-Limiter |
| AI | Google Gemini 1.5 Flash (free tier) |
| Build | Vite |
| Deployment | Vercel (frontend) · Render (backend) |

---

## Project Structure

```
pesalens/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadZone.jsx         # Drag-and-drop PDF upload
│   │   │   ├── LoadingState.jsx       # Animated loading screen
│   │   │   ├── Dashboard.jsx          # Results layout wrapper
│   │   │   ├── SummaryStats.jsx       # 4-stat summary grid
│   │   │   ├── AIAnalysisCard.jsx     # Gemini analysis display
│   │   │   ├── CategoryChart.jsx      # Horizontal bar chart (categories)
│   │   │   ├── MonthlyChart.jsx       # Horizontal bar chart (monthly)
│   │   │   ├── TopExpenses.jsx        # Top 5 expenses list
│   │   │   ├── TransactionsTable.jsx  # Paginated transaction table
│   │   │   └── ShareCardModal.jsx     # html2canvas share card
│   │   ├── App.jsx                    # Main state machine
│   │   └── index.css
│   └── .env.production                # Production API base URL
│
└── server/                  # Flask backend
    ├── app.py               # App factory
    ├── config.py            # Configuration
    ├── extensions.py        # Flask-Limiter setup
    ├── routes/
    │   ├── health.py        # GET /health
    │   └── analyze.py       # POST /analyze
    ├── schemas/
    │   └── analysis.py      # Marshmallow response schemas
    ├── service/
    │   ├── analyzer.py      # Stats computation
    │   └── gemini.py        # Gemini API integration + prompts
    ├── utils/
    │   └── pdf_parser.py    # pdfplumber + regex extraction
    ├── models/
    │   └── categories.py    # Transaction category definitions
    └── requirements.txt
```

---

## Running Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Gemini API key (free) — get one at [aistudio.google.com](https://aistudio.google.com)

### Backend

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY to .env
python app.py
```

The Flask server starts on `http://localhost:5000`.

### Frontend

```bash
cd client
npm install
npm run dev
```

The Vite dev server starts on `http://localhost:5173` and proxies `/analyze` and `/health` to the Flask backend automatically.

---

## API Reference

### `GET /health`

Health check endpoint. Used by deployment platforms and the frontend wakeup ping.

**Response**
```json
{ "status": "ok" }
```

---

### `POST /analyze`

Accepts a multipart PDF upload and returns a full analysis.

**Request**

| Field | Type | Description |
|---|---|---|
| `file` | File | M-Pesa statement PDF (max 10MB) |

**Response**

```json
{
  "success": true,
  "summary": {
    "total_transactions": 87,
    "total_in": 31000.00,
    "total_out": 22400.00,
    "net": 8600.00,
    "savings_rate": 27.74
  },
  "categories": {
    "Send Money": { "count": 14, "total": 9200.00 },
    "Buy Goods":  { "count": 23, "total": 4100.00 }
  },
  "monthly": {
    "2025-03": { "total_in": 31000.00, "total_out": 22400.00, "count": 87 }
  },
  "transactions": [ ... ],
  "ai_analysis": "This month you brought in KES 31,000 ...",
  "top_expenses": [
    { "description": "Pay Bill to 123456", "amount": 5000.00, "date": "2025-03-01" }
  ],
  "parse_method": "regex"
}
```

**Error responses**

| Status | Meaning |
|---|---|
| 400 | No file provided or wrong file type |
| 422 | Too few transactions to analyse |
| 429 | Rate limit exceeded (5 req/hour per IP) |
| 500 | Could not read the PDF |

---

## How the PDF Parser Works

1. **pdfplumber** extracts raw text from every page of the PDF
2. A regex pattern matches the standard Safaricom statement row format: `DD/MM/YYYY HH:MM:SS <Receipt> <Description> <Amount> <Balance>`
3. Each transaction is classified into a category using keyword matching (e.g. "pay bill" → Pay Bill, "till no" → Buy Goods)
4. If regex finds no matches (non-standard format), the raw text is sent to Gemini for AI-based extraction
5. Results marked with `parse_method: "ai"` show a soft warning in the UI

---

## AI Prompt Design

The Gemini analysis is designed to feel like advice from a trusted Kenyan friend — not a bank or a fintech app.

**System prompt principles:**
- Always reference actual numbers from the user's data
- Mention M-Pesa-specific context (PayBill, till numbers, Fuliza, chama patterns)
- Plain English only — no jargon like "liquidity" or "portfolio"
- Warm but honest — if someone overspent, say so kindly
- End with exactly one practical, data-specific tip
- Under 200 words

The user prompt is built dynamically from the parsed transaction data and includes total in/out, spending by category, and the top 5 expenses.

---

## Deployment

### Backend — Render

1. Connect your GitHub repo to Render
2. Set **Root Directory** to `server`
3. **Build Command:** `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`
4. **Start Command:** `.venv/bin/gunicorn "app:create_app()"`
5. Add environment variable: `GEMINI_API_KEY=your_key_here`

### Frontend — Vercel

1. Connect your GitHub repo to Vercel
2. Set **Root Directory** to `client`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. Add environment variable: `VITE_API_BASE=https://your-render-url.onrender.com`

---

## Rate Limiting

| Limit | Value |
|---|---|
| Per IP per hour | 5 requests |
| Global per hour | 100 requests |
| Max file size | 10 MB |
| File types | PDF only |

Rate limiting uses in-memory storage — counters reset on server restart. No user data is retained.

---

## Contributing

Contributions are welcome, especially from the Kenyan developer community.

**Good first issues:**
- Improved regex parsing for edge-case Safaricom statement formats
- Swahili language toggle for the AI analysis
- Support for KCB M-Pesa, Equity Eazzy, or MTN MoMo statements
- PWA support for offline-capable mobile use
- Export full analysis as a PDF summary
- Dark mode
- Shareable card design variations

**To contribute:**

```bash
git clone https://github.com/BakariJuma1/pesalens.git
cd pesalens
# Set up backend and frontend as described in Running Locally
# Create a branch, make your changes, open a pull request
```

Please keep PRs focused and include a brief description of what you changed and why.

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key |

### Frontend (`client/.env.production`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE` | Yes (prod) | Full URL of the deployed backend |

---

## License

MIT — free to use, modify, and distribute.

---

*Built with purpose. Free forever. No account. No data stored. No nonsense.*
