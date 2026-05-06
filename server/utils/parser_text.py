import re
from typing import Dict, List

from utils.parser_helpers import _categorise, _normalise_date, _infer_type_from_description

_PATTERN_NEW = re.compile(
    r"([A-Z0-9]{6,})\s+"
    r"(\d{4}-\d{2}-\d{2})\s+"
    r"(\d{2}:\d{2}:\d{2})\s+"
    r"(.+?)\s+"
    r"Completed\s+"
    r"(-?[\d,]+\.\d{2})\s+"
    r"([\d,]+\.\d{2})",
    re.MULTILINE | re.DOTALL,
)

_PATTERN_OLD = re.compile(
    r"(\d{2}/\d{2}/\d{4})\s+"
    r"(\d{2}:\d{2}:\d{2})\s+"
    r"([A-Z0-9]+)\s+"
    r"(.+?)\s+"
    r"([\d,]+\.\d{2})\s+"
    r"([\d,]+\.\d{2})",
    re.MULTILINE,
)


def _extract_new_format(text: str) -> List[Dict]:
    transactions = []
    for match in _PATTERN_NEW.finditer(text):
        ref, date, time, description, amount_str, balance_str = match.groups()
        amount      = float(amount_str.replace(",", ""))
        balance     = float(balance_str.replace(",", ""))
        tx_type     = "in" if amount >= 0 else "out"
        description = re.sub(r"\s+", " ", description).strip()
        transactions.append({
            "date":        date,
            "time":        time,
            "ref":         ref,
            "description": description,
            "amount":      abs(amount),
            "balance":     balance,
            "type":        tx_type,
            "category":    _categorise(description, tx_type),
        })
    return transactions


def _extract_old_format(text: str) -> List[Dict]:
    transactions = []
    for match in _PATTERN_OLD.finditer(text):
        date, time, ref, description, amount_str, balance_str = match.groups()
        amount  = float(amount_str.replace(",", ""))
        balance = float(balance_str.replace(",", ""))
        tx_type = _infer_type_from_description(description)
        transactions.append({
            "date":        _normalise_date(date),
            "time":        time,
            "ref":         ref,
            "description": description.strip(),
            "amount":      amount,
            "balance":     balance,
            "type":        tx_type,
            "category":    _categorise(description, tx_type),
        })
    return transactions
