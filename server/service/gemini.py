import os
import json
import logging
import requests
from typing import Dict, List

logger = logging.getLogger(__name__)

_GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
_MODEL = "llama-3.3-70b-versatile"

_SYSTEM_PROMPT = (
    "You are a sharp, warm Kenyan financial advisor analyzing real M-Pesa data.\n\n"
    "Structure your response in exactly this order:\n"
    "1. OVERVIEW: One sentence on their overall money situation with exact amounts.\n"
    "2. BIGGEST DRAIN: Which category takes the most money, what % of spending it is, and whether that seems normal.\n"
    "3. PATTERN: One specific pattern you see — recurring payments, same recipient weekly, "
    "end-of-month spend spikes, signs of Fuliza use, or anything unusual. Name it specifically.\n"
    "4. BALANCE HEALTH: Is their closing balance better or worse than opening? Are they building savings or draining?\n"
    "5. TIP: One concrete, specific action they can take based on exactly what you see in their data.\n\n"
    "Rules:\n"
    "- Quote exact KES amounts and percentages always. Never say 'a lot' or 'quite a bit'.\n"
    "- Reference actual transaction descriptions when pointing out patterns.\n"
    "- Be direct and warm, like a trusted friend who knows money.\n"
    "- Under 250 words total. No headers or bullet points — write in flowing paragraphs."
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


def generate_analysis(
    summary: Dict,
    categories: Dict,
    top_expenses: List,
    balance_trend: Dict = None,
    avg_daily_spend: float = 0,
    recurring_payments: List = None,
    payday_info: Dict = None,
    withdrawal_summary: Dict = None,
    fuliza_usage: Dict = None,
) -> str:
    try:
        prompt = _build_user_prompt(
            summary, categories, top_expenses,
            balance_trend, avg_daily_spend,
            recurring_payments, payday_info, withdrawal_summary, fuliza_usage,
        )
        return _call_groq(_SYSTEM_PROMPT, prompt, max_tokens=600)
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


def _build_user_prompt(
    summary: Dict,
    categories: Dict,
    top_expenses: List,
    balance_trend: Dict = None,
    avg_daily_spend: float = 0,
    recurring_payments: List = None,
    payday_info: Dict = None,
    withdrawal_summary: Dict = None,
    fuliza_usage: Dict = None,
) -> str:
    net_label = "saved" if summary["net"] >= 0 else "overspent"
    total_out = summary["total_out"] or 1

    cat_lines = "\n".join(
        f"- {cat}: KES {data['total']:,.0f} ({round(data['total'] / total_out * 100)}% of spending, {data['count']} transactions)"
        for cat, data in sorted(categories.items(), key=lambda x: x[1]["total"], reverse=True)
    )
    expense_lines = "\n".join(
        f"- {e['description']}: KES {e['amount']:,.0f} on {e['date']}"
        for e in top_expenses
    )

    prompt = (
        f"My M-Pesa statement data:\n\n"
        f"Total received: KES {summary['total_in']:,.0f}\n"
        f"Total spent: KES {summary['total_out']:,.0f}\n"
        f"Net: KES {abs(summary['net']):,.0f} ({net_label})\n"
        f"Transactions: {summary['total_transactions']}\n"
        f"Average daily spend: KES {avg_daily_spend:,.0f}\n"
    )

    if balance_trend:
        direction = "up" if balance_trend["change"] >= 0 else "down"
        prompt += (
            f"Opening balance: KES {balance_trend['opening']:,.0f} | "
            f"Closing: KES {balance_trend['closing']:,.0f} ({direction} KES {abs(balance_trend['change']):,.0f})\n"
        )

    if withdrawal_summary and withdrawal_summary.get("total_withdrawn", 0) > 0:
        prompt += (
            f"Cash withdrawn: KES {withdrawal_summary['total_withdrawn']:,.0f} "
            f"({withdrawal_summary['cash_percentage']}% of spending is untracked cash)\n"
        )

    if payday_info:
        prompt += (
            f"Biggest income day: {payday_info['payday_date']} "
            f"(KES {payday_info['payday_amount']:,.0f} received)\n"
            f"Spent in 7 days after payday: KES {payday_info['week_spend_after']:,.0f} "
            f"({payday_info['velocity_pct']}% of that income)\n"
        )

    prompt += f"\nSpending by category:\n{cat_lines}\n\n"
    prompt += f"Top 5 single transactions:\n{expense_lines}\n"

    if recurring_payments:
        rec_lines = "\n".join(
            f"- {r['description']}: KES {r['avg_amount']:,.0f} avg, {r['count']} times across {r['months']} months"
            for r in recurring_payments[:4]
        )
        prompt += f"\nDetected recurring payments:\n{rec_lines}\n"

    if fuliza_usage and fuliza_usage.get("used"):
        prompt += (
            f"\nFuliza usage: borrowed {fuliza_usage['borrow_count']}x "
            f"(KES {fuliza_usage['total_borrowed']:,.0f}), "
            f"repaid KES {fuliza_usage['total_repaid']:,.0f}, "
            f"outstanding KES {fuliza_usage['net_outstanding']:,.0f}\n"
        )

    prompt += "\nAnalyse my spending with the structure I gave you."
    return prompt


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
