from typing import Dict, List


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
