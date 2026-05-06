import re
from typing import Dict, List


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
        m = re.search(r"pay bill(?:\s+online)?\s+(\d+)", desc, re.IGNORECASE)
        if m:
            num = m.group(1)
            return _KNOWN_PAYBILL.get(num, f"PayBill {num}")
        m2 = re.search(r"\bto\s+([A-Za-z][A-Za-z0-9 ]{2,})", desc, re.IGNORECASE)
        if m2:
            return m2.group(1).strip().title()[:30]
    elif category == "Buy Goods":
        m = re.search(
            r"(?:merchant payment|buy goods)(?:\s+online)?\s+(?:to\s+)?(.+)",
            desc, re.IGNORECASE,
        )
        if m:
            name = re.sub(r"\s+\d+\s*$", "", m.group(1)).strip()
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
