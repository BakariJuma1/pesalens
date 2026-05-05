import re as _re
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from utils.pdf_parser import parse_pdf
from service.gemini import generate_analysis


def analyze_statement(pdf_bytes: bytes, password: str = "") -> Dict:
    transactions, parse_method = parse_pdf(pdf_bytes, password=password)

    if len(transactions) < 5:
        raise ValueError(
            "Not enough transactions to analyse. Try uploading a full monthly statement."
        )

    summary          = _compute_summary(transactions)
    categories       = _compute_categories(transactions)
    monthly          = _compute_monthly(transactions)
    top_expenses     = _compute_top_expenses(transactions)
    balance_trend    = _compute_balance_trend(transactions)
    avg_daily_spend  = _compute_avg_daily_spend(summary, transactions)
    top_recipients   = _compute_top_recipients(transactions)

    # Tier 1 & 2 insights
    day_of_week          = _compute_day_of_week(transactions)
    recurring_payments   = _detect_recurring(transactions)
    balance_timeline     = _compute_balance_timeline(transactions)
    withdrawal_summary   = _compute_withdrawal_summary(summary, transactions)
    payday_info          = _detect_payday(transactions)
    top_merchants        = _compute_top_merchants(transactions)
    send_money_frequency = _compute_send_money_frequency(transactions)

    ai_analysis = generate_analysis(
        summary, categories, top_expenses,
        balance_trend=balance_trend,
        avg_daily_spend=avg_daily_spend,
        recurring_payments=recurring_payments,
        payday_info=payday_info,
        withdrawal_summary=withdrawal_summary,
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
        "day_of_week": day_of_week,
        "recurring_payments": recurring_payments,
        "balance_timeline": balance_timeline,
        "withdrawal_summary": withdrawal_summary,
        "payday_info": payday_info,
        "top_merchants": top_merchants,
        "send_money_frequency": send_money_frequency,
    }


# ── Existing computations ────────────────────────────────────────────────────

def _compute_summary(transactions: List[Dict]) -> Dict:
    total_in  = sum(t["amount"] for t in transactions if t["type"] == "in")
    total_out = sum(t["amount"] for t in transactions if t["type"] == "out")
    net = total_in - total_out
    savings_rate = round((net / total_in * 100), 2) if total_in > 0 else 0.0
    return {
        "total_transactions": len(transactions),
        "total_in":    round(total_in, 2),
        "total_out":   round(total_out, 2),
        "net":         round(net, 2),
        "savings_rate": savings_rate,
    }


def _compute_categories(transactions: List[Dict]) -> Dict:
    cats: Dict = {}
    for t in transactions:
        if t["type"] != "out":
            continue
        cat = t.get("category", "Other")
        if cat not in cats:
            cats[cat] = {"count": 0, "total": 0.0}
        cats[cat]["count"] += 1
        cats[cat]["total"] = round(cats[cat]["total"] + t["amount"], 2)
    return cats


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
    return [
        {"description": t["description"], "amount": t["amount"], "date": t.get("date", "")}
        for t in sorted(outgoing, key=lambda x: x["amount"], reverse=True)[:5]
    ]


def _compute_balance_trend(transactions: List[Dict]) -> Dict:
    if not transactions:
        return {}
    sorted_tx = sorted(transactions, key=lambda x: (x.get("date", ""), x.get("time", "")))
    first = sorted_tx[0]
    opening = (
        first["balance"] + first["amount"] if first["type"] == "out"
        else first["balance"] - first["amount"]
    )
    closing = sorted_tx[-1]["balance"]
    return {
        "opening": round(opening, 2),
        "closing": round(closing, 2),
        "change":  round(closing - opening, 2),
    }


def _compute_avg_daily_spend(summary: Dict, transactions: List[Dict]) -> float:
    dates = {t["date"] for t in transactions if t.get("date")}
    return round(summary["total_out"] / len(dates), 0) if dates else 0.0


# ── Tier 1 ───────────────────────────────────────────────────────────────────

def _compute_day_of_week(transactions: List[Dict]) -> List[Dict]:
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    spend  = {d: 0.0 for d in days}
    counts = {d: 0   for d in days}
    for t in transactions:
        if t["type"] != "out" or not t.get("date"):
            continue
        try:
            weekday = datetime.strptime(t["date"], "%Y-%m-%d").weekday()
            d = days[weekday]
            spend[d]  += t["amount"]
            counts[d] += 1
        except ValueError:
            pass
    return [{"day": d, "total": round(spend[d], 2), "count": counts[d]} for d in days]


def _detect_recurring(transactions: List[Dict]) -> List[Dict]:
    groups: Dict[str, list] = defaultdict(list)
    for t in transactions:
        if t["type"] != "out" or not t.get("description"):
            continue
        sig = _re.sub(r"\b\d+\b", "", t["description"].lower()).strip()
        sig = _re.sub(r"\s+", " ", sig)[:50]
        if len(sig) >= 5:
            groups[sig].append(t)

    recurring = []
    for _, txs in groups.items():
        if len(txs) < 2:
            continue
        months = {t["date"][:7] for t in txs if t.get("date")}
        if len(months) < 2:
            continue
        amounts = [t["amount"] for t in txs]
        recurring.append({
            "description": txs[0]["description"],
            "count":       len(txs),
            "avg_amount":  round(sum(amounts) / len(amounts), 2),
            "total":       round(sum(amounts), 2),
            "months":      len(months),
        })

    return sorted(recurring, key=lambda x: x["total"], reverse=True)[:6]


def _compute_balance_timeline(transactions: List[Dict]) -> List[Dict]:
    if not transactions:
        return []
    daily: Dict[str, float] = {}
    for t in sorted(transactions, key=lambda x: (x.get("date", ""), x.get("time", ""))):
        if t.get("date"):
            daily[t["date"]] = t["balance"]
    return [{"date": d, "balance": b} for d, b in sorted(daily.items())]


def _compute_withdrawal_summary(summary: Dict, transactions: List[Dict]) -> Dict:
    withdrawn = [t for t in transactions if t.get("category") == "Withdraw"]
    total_cash    = round(sum(t["amount"] for t in withdrawn), 2)
    total_digital = round(summary["total_out"] - total_cash, 2)
    total_out = summary["total_out"] or 1
    return {
        "total_withdrawn":   total_cash,
        "total_digital":     total_digital,
        "withdrawal_count":  len(withdrawn),
        "cash_percentage":   round(total_cash / total_out * 100, 1),
    }


# ── Tier 2 ───────────────────────────────────────────────────────────────────

_KNOWN_PAYBILL = {
    "888880": "KPLC",
    "200222": "Safaricom",
    "222222": "Airtel",
    "101010": "Zuku",
    "300622": "Nairobi Water",
    "400200": "GoTV",
    "507506": "DSTV",
    "220220": "Stima SACCO",
    "247247": "Equity Bank",
}


def _extract_merchant_name(desc: str, category: str) -> str:
    if category == "Pay Bill":
        m = _re.search(r"pay bill(?:\s+online)?\s+(\d+)", desc, _re.IGNORECASE)
        if m:
            num = m.group(1)
            return _KNOWN_PAYBILL.get(num, f"PayBill {num}")
        # Try "to MERCHANT" pattern
        m2 = _re.search(r"\bto\s+([A-Za-z][A-Za-z0-9 ]{2,})", desc, _re.IGNORECASE)
        if m2:
            return m2.group(1).strip().title()[:30]
    elif category == "Buy Goods":
        m = _re.search(
            r"(?:merchant payment|buy goods)(?:\s+online)?\s+(?:to\s+)?(.+)",
            desc, _re.IGNORECASE,
        )
        if m:
            name = _re.sub(r"\s+\d+\s*$", "", m.group(1)).strip()
            return name[:30].title() if name else ""
    return desc[:25].title()


def _compute_top_merchants(transactions: List[Dict]) -> List[Dict]:
    merchants: Dict[str, Dict] = {}
    for t in transactions:
        if t["type"] != "out" or t.get("category") not in ("Pay Bill", "Buy Goods"):
            continue
        name = _extract_merchant_name(t.get("description", ""), t.get("category", ""))
        if not name:
            continue
        if name not in merchants:
            merchants[name] = {"name": name, "total": 0.0, "count": 0, "category": t["category"]}
        merchants[name]["total"] = round(merchants[name]["total"] + t["amount"], 2)
        merchants[name]["count"] += 1
    return sorted(merchants.values(), key=lambda x: x["total"], reverse=True)[:8]


def _detect_payday(transactions: List[Dict]) -> Optional[Dict]:
    daily_in: Dict[str, float] = defaultdict(float)
    for t in transactions:
        if t["type"] == "in" and t.get("date"):
            daily_in[t["date"]] += t["amount"]

    if not daily_in:
        return None

    top_days = sorted(daily_in.items(), key=lambda x: x[1], reverse=True)
    main_date, main_amount = top_days[0]

    try:
        payday_dt = datetime.strptime(main_date, "%Y-%m-%d")
        cutoff    = (payday_dt + timedelta(days=7)).strftime("%Y-%m-%d")
        week_spend = sum(
            t["amount"] for t in transactions
            if t["type"] == "out" and main_date <= t.get("date", "") <= cutoff
        )
        velocity_pct = round(week_spend / main_amount * 100, 1) if main_amount else 0
    except ValueError:
        week_spend, velocity_pct = 0.0, 0.0

    return {
        "payday_date":      main_date,
        "payday_amount":    round(main_amount, 2),
        "week_spend_after": round(week_spend, 2),
        "velocity_pct":     velocity_pct,
    }


def _compute_send_money_frequency(transactions: List[Dict]) -> List[Dict]:
    freq: Dict[str, Dict] = {}
    for t in transactions:
        if t.get("category") != "Send Money" or t["type"] != "out":
            continue
        name = _extract_recipient_name(t.get("description", ""))
        if not name:
            continue
        if name not in freq:
            freq[name] = {"name": name, "count": 0, "total": 0.0}
        freq[name]["count"] += 1
        freq[name]["total"] = round(freq[name]["total"] + t["amount"], 2)
    return sorted(freq.values(), key=lambda x: x["count"], reverse=True)[:5]


# ── Shared helpers ────────────────────────────────────────────────────────────

_TX_PREFIX_RE  = _re.compile(
    r"(?:customer transfer to|transfer to|sent to)\s*[-–]?\s*", _re.IGNORECASE
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
    return sorted(totals.values(), key=lambda x: x["total"], reverse=True)[:5]
