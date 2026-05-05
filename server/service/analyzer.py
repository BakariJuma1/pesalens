from typing import Dict, List

from utils.pdf_parser import parse_pdf
from service.gemini import generate_analysis


def analyze_statement(pdf_bytes: bytes, password: str = "") -> Dict:
    transactions, parse_method = parse_pdf(pdf_bytes, password=password)

    if len(transactions) < 5:
        raise ValueError(
            "Not enough transactions to analyse. Try uploading a full monthly statement."
        )

    summary = _compute_summary(transactions)
    categories = _compute_categories(transactions)
    monthly = _compute_monthly(transactions)
    top_expenses = _compute_top_expenses(transactions)
    balance_trend = _compute_balance_trend(transactions)
    avg_daily_spend = _compute_avg_daily_spend(summary, transactions)
    top_recipients = _compute_top_recipients(transactions)

    ai_analysis = generate_analysis(
        summary, categories, top_expenses,
        balance_trend=balance_trend,
        avg_daily_spend=avg_daily_spend,
    )

    return {
        "success": True,
        "summary": summary,
        "categories": categories,
        "monthly": monthly,
        "transactions": transactions[:100],
        "ai_analysis": ai_analysis,
        "top_expenses": top_expenses,
        "top_recipients": top_recipients,
        "parse_method": parse_method,
    }


def _compute_summary(transactions: List[Dict]) -> Dict:
    total_in = sum(t["amount"] for t in transactions if t["type"] == "in")
    total_out = sum(t["amount"] for t in transactions if t["type"] == "out")
    net = total_in - total_out
    savings_rate = round((net / total_in * 100), 2) if total_in > 0 else 0.0
    return {
        "total_transactions": len(transactions),
        "total_in": round(total_in, 2),
        "total_out": round(total_out, 2),
        "net": round(net, 2),
        "savings_rate": savings_rate,
    }


def _compute_categories(transactions: List[Dict]) -> Dict:
    categories: Dict = {}
    for t in transactions:
        if t["type"] != "out":
            continue
        cat = t.get("category", "Other")
        if cat not in categories:
            categories[cat] = {"count": 0, "total": 0.0}
        categories[cat]["count"] += 1
        categories[cat]["total"] = round(categories[cat]["total"] + t["amount"], 2)
    return categories


def _compute_monthly(transactions: List[Dict]) -> Dict:
    monthly: Dict = {}
    for t in transactions:
        month = t["date"][:7] if t.get("date") else "Unknown"
        if month not in monthly:
            monthly[month] = {"total_in": 0.0, "total_out": 0.0, "count": 0}
        if t["type"] == "in":
            monthly[month]["total_in"] = round(monthly[month]["total_in"] + t["amount"], 2)
        else:
            monthly[month]["total_out"] = round(monthly[month]["total_out"] + t["amount"], 2)
        monthly[month]["count"] += 1
    return monthly


def _compute_top_expenses(transactions: List[Dict]) -> List[Dict]:
    outgoing = [t for t in transactions if t["type"] == "out"]
    sorted_out = sorted(outgoing, key=lambda x: x["amount"], reverse=True)
    return [
        {"description": t["description"], "amount": t["amount"], "date": t.get("date", "")}
        for t in sorted_out[:5]
    ]


def _compute_balance_trend(transactions: List[Dict]) -> Dict:
    if not transactions:
        return {}
    sorted_tx = sorted(
        transactions,
        key=lambda x: (x.get("date", ""), x.get("time", "")),
    )
    first = sorted_tx[0]
    opening = (
        first["balance"] + first["amount"]
        if first["type"] == "out"
        else first["balance"] - first["amount"]
    )
    closing = sorted_tx[-1]["balance"]
    return {
        "opening": round(opening, 2),
        "closing": round(closing, 2),
        "change": round(closing - opening, 2),
    }


def _compute_avg_daily_spend(summary: Dict, transactions: List[Dict]) -> float:
    dates = {t["date"] for t in transactions if t.get("date")}
    if not dates:
        return 0.0
    return round(summary["total_out"] / len(dates), 0)


import re as _re

_TX_PREFIX_RE = _re.compile(
    r"(?:customer transfer to|transfer to|sent to)\s*[-–]?\s*",
    _re.IGNORECASE,
)
_PHONE_PREFIX_RE = _re.compile(r"^(?:2547|2541|07|01)\d+\s*", _re.IGNORECASE)


def _extract_recipient_name(desc: str) -> str:
    name = _TX_PREFIX_RE.sub("", desc).strip()
    name = _PHONE_PREFIX_RE.sub("", name).strip()
    if not name or name in {"-", "–"} or len(name) < 2 or name.isdigit():
        return ""
    return name.title()


def _compute_top_recipients(transactions: List[Dict]) -> List[Dict]:
    totals: Dict[str, Dict] = {}
    for t in transactions:
        if t.get("category") != "Send Money" or t["type"] != "out":
            continue
        name = _extract_recipient_name(t.get("description", ""))
        if not name:
            continue
        if name not in totals:
            totals[name] = {"name": name, "total": 0.0, "count": 0}
        totals[name]["total"] = round(totals[name]["total"] + t["amount"], 2)
        totals[name]["count"] += 1

    ranked = sorted(totals.values(), key=lambda x: x["total"], reverse=True)
    return ranked[:5]
