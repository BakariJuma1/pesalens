import re
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional


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
        sig = re.sub(r"\b\d+\b", "", t["description"].lower()).strip()
        sig = re.sub(r"\s+", " ", sig)[:50]
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
        payday_dt  = datetime.strptime(main_date, "%Y-%m-%d")
        cutoff     = (payday_dt + timedelta(days=7)).strftime("%Y-%m-%d")
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
