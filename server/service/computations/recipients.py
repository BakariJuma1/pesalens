import re
from typing import Dict, List


_TX_PREFIX_RE = re.compile(
    r"(?:customer payment to small business from|customer transfer to|transfer to|sent to)"
    r"\s*[-–]?\s*",
    re.IGNORECASE,
)
# matches full or masked phone numbers: 0712345678 / 254712345678 / 2547***678
_PHONE_PREFIX_RE = re.compile(r"^(?:2547|2541|07|01)[0-9*]+\s*", re.IGNORECASE)

_BUSINESS_KEYWORDS = {
    "pochi", "biashara", "agent", "till", "paybill", "business",
    "limited", "ltd", "company", "enterprise", "shop", "store",
}

_POCHI_RE  = re.compile(r"customer payment to small business", re.IGNORECASE)
_CHARGE_RE = re.compile(r"\bcharge\b|\bfee\b", re.IGNORECASE)


def _extract_recipient_name(desc: str) -> str:
    name = _TX_PREFIX_RE.sub("", desc).strip()
    name = _PHONE_PREFIX_RE.sub("", name).strip()
    name = name.lstrip("-–").strip()
    if not name or len(name) < 2 or name.isdigit():
        return ""
    return name.title()


def _extract_sender_name(desc: str) -> str:
    cleaned = re.sub(
        r"(?:customer transfer from|transfer from|payment from|received from|funds|from)"
        r"\s*[-–]?\s*",
        "", desc, flags=re.IGNORECASE,
    ).strip()
    cleaned = _PHONE_PREFIX_RE.sub("", cleaned).strip()
    cleaned = cleaned.lstrip("-–").strip()
    if not cleaned or len(cleaned) < 2 or cleaned.isdigit():
        return ""
    return cleaned.title()[:35]


def _is_individual(name: str) -> bool:
    lower = name.lower()
    return not any(kw in lower for kw in _BUSINESS_KEYWORDS)


def _compute_top_recipients(transactions: List[Dict]) -> List[Dict]:
    totals: Dict[str, Dict] = {}
    for t in transactions:
        if t.get("category") != "Send Money" or t["type"] != "out":
            continue
        desc = t.get("description", "")
        if _POCHI_RE.search(desc) or _CHARGE_RE.search(desc):
            continue
        name = _extract_recipient_name(desc)
        if not name or not _is_individual(name):
            continue
        if name not in totals:
            totals[name] = {"name": name, "total": 0.0, "count": 0}
        totals[name]["total"] = round(totals[name]["total"] + t["amount"], 2)
        totals[name]["count"] += 1
    return sorted(totals.values(), key=lambda x: x["total"], reverse=True)[:7]


def _compute_pochi_recipients(transactions: List[Dict]) -> List[Dict]:
    totals: Dict[str, Dict] = {}
    for t in transactions:
        if t["type"] != "out" or not _POCHI_RE.search(t.get("description", "")):
            continue
        name = _extract_recipient_name(t.get("description", ""))
        if not name:
            continue
        if name not in totals:
            totals[name] = {"name": name, "total": 0.0, "count": 0}
        totals[name]["total"] = round(totals[name]["total"] + t["amount"], 2)
        totals[name]["count"] += 1
    return sorted(totals.values(), key=lambda x: x["total"], reverse=True)[:7]


def _compute_send_money_frequency(transactions: List[Dict]) -> List[Dict]:
    freq: Dict[str, Dict] = {}
    for t in transactions:
        if t.get("category") != "Send Money" or t["type"] != "out":
            continue
        name = _extract_recipient_name(t.get("description", ""))
        if not name or not _is_individual(name):
            continue
        if name not in freq:
            freq[name] = {"name": name, "count": 0, "total": 0.0}
        freq[name]["count"] += 1
        freq[name]["total"] = round(freq[name]["total"] + t["amount"], 2)
    return sorted(freq.values(), key=lambda x: x["count"], reverse=True)[:5]
