import os
import json
import logging
import requests
from typing import Dict, List

logger = logging.getLogger(__name__)

_GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
_MODEL = "llama-3.3-70b-versatile"

_SYSTEM_PROMPT = (
    "You are a friendly, sharp Kenyan financial advisor. You speak plainly and warmly, "
    "like a trusted friend who happens to understand money, not a bank or an app. "
    "You know M-Pesa inside out: send money, PayBill, buy goods, Fuliza, till numbers, "
    "Safaricom bundles, and the real ways Kenyans manage money day-to-day.\n\n"
    "Rules:\n"
    "- Always use the actual numbers from the data. Never be vague.\n"
    "- Reference specific patterns you notice (same number every week = likely rent/chama).\n"
    "- Use plain English. No jargon. Shorten amounts: KES 12,400 not KES 12,400.00.\n"
    "- Be warm but honest. If spending is high, say so, kindly.\n"
    "- End with exactly ONE practical tip tied directly to their data.\n"
    "- Keep the whole response under 200 words."
)

_EXTRACTION_PROMPT = (
    "Extract all M-Pesa transactions from the text below. "
    "Return a JSON array where each item has: date (YYYY-MM-DD), time (HH:MM:SS), "
    "ref (receipt number), description, amount (float), balance (float), type ('in' or 'out'). "
    "Only return the JSON array, nothing else.\n\nSTATEMENT TEXT:\n"
)


def _call_groq(system: str, user: str, max_tokens: int = 512) -> str:
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        raise ValueError("No GROQ_API_KEY configured")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": _MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.4,
    }

    resp = requests.post(_GROQ_URL, headers=headers, json=payload, timeout=30)
    if resp.status_code == 429:
        raise RuntimeError("Groq rate limited")
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"].strip()


def generate_analysis(summary: Dict, categories: Dict, top_expenses: List) -> str:
    try:
        prompt = _build_user_prompt(summary, categories, top_expenses)
        return _call_groq(_SYSTEM_PROMPT, prompt, max_tokens=512)
    except Exception as exc:
        logger.error("Groq analysis failed: %s", exc, exc_info=True)
        return _fallback_analysis(summary, categories)


def extract_transactions_ai(raw_text: str) -> List[Dict]:
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return []

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": _MODEL,
        "messages": [
            {"role": "user", "content": _EXTRACTION_PROMPT + raw_text[:8000]},
        ],
        "max_tokens": 4096,
        "temperature": 0.0,
    }
    try:
        resp = requests.post(_GROQ_URL, headers=headers, json=payload, timeout=60)
        resp.raise_for_status()
        text = resp.json()["choices"][0]["message"]["content"].strip()

        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]

        transactions = json.loads(text)
        from utils.pdf_parser import _categorise
        for tx in transactions:
            if "category" not in tx:
                tx["category"] = _categorise(tx.get("description", ""), tx.get("type", "out"))
        return transactions
    except Exception:
        return []


def _build_user_prompt(summary: Dict, categories: Dict, top_expenses: List) -> str:
    net_label = "saved" if summary["net"] >= 0 else "overspent"
    cat_lines = "\n".join(
        f"- {cat}: KES {data['total']:,.0f} ({data['count']} transactions)"
        for cat, data in sorted(categories.items(), key=lambda x: x[1]["total"], reverse=True)
    )
    expense_lines = "\n".join(
        f"- {e['description']}: KES {e['amount']:,.0f} on {e['date']}"
        for e in top_expenses
    )
    return (
        f"Here is a summary of my M-Pesa statement:\n\n"
        f"Total money IN: KES {summary['total_in']:,.0f}\n"
        f"Total money OUT: KES {summary['total_out']:,.0f}\n"
        f"Net position: KES {abs(summary['net']):,.0f} ({net_label})\n"
        f"Number of transactions: {summary['total_transactions']}\n\n"
        f"Spending by category:\n{cat_lines}\n\n"
        f"Top 5 largest outgoing transactions:\n{expense_lines}\n\n"
        "Give me a plain-English analysis of my spending. What stands out? "
        "Where is my money actually going? End with one practical tip."
    )


def _fallback_analysis(summary: Dict, categories: Dict) -> str:
    top_cat = (
        max(categories.items(), key=lambda x: x[1]["total"])[0]
        if categories else "various categories"
    )
    net_label = "saved" if summary["net"] >= 0 else "overspent"
    return (
        f"You brought in KES {summary['total_in']:,.0f} and spent "
        f"KES {summary['total_out']:,.0f}. You {net_label} "
        f"KES {abs(summary['net']):,.0f}. "
        f"Most of your spending went to {top_cat}. "
        f"AI analysis is temporarily unavailable. Try again in a few minutes."
    )
