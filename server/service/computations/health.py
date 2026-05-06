from typing import Dict, List, Optional

from service.computations.recipients import _extract_sender_name


def _detect_fuliza(transactions: List[Dict]) -> Dict:
    borrowed = [
        t for t in transactions
        if "fuliza" in t.get("description", "").lower() and t["type"] == "in"
    ]
    repaid = [
        t for t in transactions
        if "fuliza" in t.get("description", "").lower() and t["type"] == "out"
    ]
    total_borrowed = round(sum(t["amount"] for t in borrowed), 2)
    total_repaid   = round(sum(t["amount"] for t in repaid), 2)
    return {
        "used":            len(borrowed) > 0 or len(repaid) > 0,
        "total_borrowed":  total_borrowed,
        "total_repaid":    total_repaid,
        "net_outstanding": round(total_borrowed - total_repaid, 2),
        "borrow_count":    len(borrowed),
        "repay_count":     len(repaid),
    }


def _compute_income_breakdown(transactions: List[Dict]) -> List[Dict]:
    sources: Dict[str, Dict] = {}
    for t in transactions:
        if t["type"] != "in":
            continue
        if "fuliza" in t.get("description", "").lower():
            continue
        name = _extract_sender_name(t.get("description", ""))
        if not name:
            name = t.get("category", "Other")
        if name not in sources:
            sources[name] = {"name": name, "total": 0.0, "count": 0}
        sources[name]["total"] = round(sources[name]["total"] + t["amount"], 2)
        sources[name]["count"] += 1
    return sorted(sources.values(), key=lambda x: x["total"], reverse=True)[:6]


def _compute_health_score(
    summary: Dict,
    balance_trend: Dict,
    payday_info: Optional[Dict],
    withdrawal_summary: Dict,
    fuliza: Dict,
) -> Dict:
    components = []
    total = 0

    sr = summary.get("savings_rate", 0)
    if sr >= 20:
        s, note = 30, f"{sr}% savings rate — excellent"
    elif sr >= 10:
        s, note = 20, f"{sr}% savings rate — aim for 20%"
    elif sr >= 0:
        s, note = 10, f"{sr}% savings rate — breaking even"
    else:
        s, note = 0, "Spending more than you earn"
    components.append({"label": "Savings Rate", "score": s, "max_score": 30, "note": note})
    total += s

    opening = (balance_trend or {}).get("opening", 1) or 1
    change  = (balance_trend or {}).get("change", 0)
    pct     = change / opening * 100 if opening else 0
    if pct >= 10:
        s, note = 20, "Balance grew this period"
    elif pct >= 0:
        s, note = 12, "Balance holding steady"
    elif pct >= -10:
        s, note = 6, "Balance slightly declining"
    else:
        s, note = 0, "Balance falling fast"
    components.append({"label": "Balance Trend", "score": s, "max_score": 20, "note": note})
    total += s

    velocity = (payday_info or {}).get("velocity_pct", 0)
    if velocity < 40:
        s, note = 20, f"Spent {velocity}% of income week after payday"
    elif velocity < 60:
        s, note = 12, f"Spent {velocity}% of payday income in 7 days"
    elif velocity < 80:
        s, note = 6, f"{velocity}% of income gone in one week"
    else:
        s, note = 0, f"{velocity}% spent in 7 days of receiving money"
    components.append({"label": "Payday Discipline", "score": s, "max_score": 20, "note": note})
    total += s

    cash_pct = (withdrawal_summary or {}).get("cash_percentage", 0)
    if cash_pct <= 10:
        s, note = 15, f"Only {cash_pct}% cash — spending mostly trackable"
    elif cash_pct <= 30:
        s, note = 8, f"{cash_pct}% cash withdrawals"
    else:
        s, note = 0, f"{cash_pct}% cash — hard to track spending"
    components.append({"label": "Digital Spending", "score": s, "max_score": 15, "note": note})
    total += s

    if not (fuliza or {}).get("used"):
        s, note = 15, "No Fuliza usage detected"
    elif (fuliza or {}).get("net_outstanding", 0) <= 0:
        bc = fuliza.get("borrow_count", 0)
        s, note = 8, f"Used Fuliza {bc}x but fully repaid"
    else:
        outstanding = fuliza.get("net_outstanding", 0)
        s, note = 0, f"KES {outstanding:,.0f} outstanding Fuliza"
    components.append({"label": "Debt-Free", "score": s, "max_score": 15, "note": note})
    total += s

    if total >= 80:
        label = "Excellent"
    elif total >= 60:
        label = "Good"
    elif total >= 40:
        label = "Fair"
    else:
        label = "Needs Work"

    return {"score": total, "label": label, "components": components}
