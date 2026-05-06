# Contributing to PesaLense

Contributions are welcome, especially from the Kenyan developer community.

## Good first issues

- Improved regex parsing for edge-case Safaricom statement formats
- Swahili language toggle for the AI analysis
- Support for KCB M-Pesa, Equity Eazzy, or MTN MoMo statements
- PWA support for offline-capable mobile use
- Dark mode
- Shareable card design variations

## Getting started

```bash
git clone https://github.com/BakariJuma1/pesalens.git
cd pesalens
```

Set up the backend:

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your GROQ_API_KEY to .env
python app.py
```

Set up the frontend:

```bash
cd client
npm install
npm run dev
```

## Pull request guidelines

- Keep PRs focused — one change per PR
- Include a brief description of what changed and why
- Test on mobile if you're touching UI
- Don't add analytics, tracking, or external requests beyond the Groq API

## Project values

This tool is free forever. No monetization, no accounts, no data storage. Any contribution that moves toward collecting user data or adding paywalls will not be merged.
