import io
import re
from typing import List, Dict, Tuple

from models.categories import CATEGORY_PATTERNS

_TEXT_KWARGS = {"x_tolerance": 3, "y_tolerance": 3, "layout": False}

# Current Safaricom format: RECEIPT YYYY-MM-DD HH:MM:SS DESCRIPTION Completed AMOUNT BALANCE
_PATTERN_NEW = re.compile(
    r"([A-Z0-9]{6,})\s+"           # receipt number
    r"(\d{4}-\d{2}-\d{2})\s+"      # date YYYY-MM-DD
    r"(\d{2}:\d{2}:\d{2})\s+"      # time
    r"(.+?)\s+"                     # description (non-greedy, single line)
    r"Completed\s+"                 # status column
    r"(-?[\d,]+\.\d{2})\s+"        # amount (negative = money out)
    r"([\d,]+\.\d{2})",            # balance
    re.MULTILINE,
)

# Legacy format: DD/MM/YYYY HH:MM:SS RECEIPT DESCRIPTION AMOUNT BALANCE
_PATTERN_OLD = re.compile(
    r"(\d{2}/\d{2}/\d{4})\s+"
    r"(\d{2}:\d{2}:\d{2})\s+"
    r"([A-Z0-9]+)\s+"
    r"(.+?)\s+"
    r"([\d,]+\.\d{2})\s+"
    r"([\d,]+\.\d{2})",
    re.MULTILINE,
)


def parse_pdf(pdf_bytes: bytes, password: str = "") -> Tuple[List[Dict], str]:
    open_kwargs = {"password": password} if password else {}
    pages_text = []

    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(pdf_bytes), **open_kwargs) as pdf:
            for page in pdf.pages:
                try:
                    text = page.extract_text(**_TEXT_KWARGS) or ""
                except Exception:
                    text = page.extract_text() or ""
                pages_text.append(text)
                page.flush_cache()
    except Exception as exc:
        err = str(exc).lower()
        if "password" in err or "encrypt" in err or "decrypt" in err:
            raise ValueError(
                "This PDF is password-protected. Enter the password Safaricom sent you via SMS (usually your ID number)."
            )
        raise

    full_text = "\n".join(pages_text)

    transactions = _extract_new_format(full_text)
    if transactions:
        return transactions, "regex"

    transactions = _extract_old_format(full_text)
    if transactions:
        return transactions, "regex"

    from service.gemini import extract_transactions_ai
    transactions = extract_transactions_ai(full_text)
    return transactions, "ai"


def _extract_new_format(text: str) -> List[Dict]:
    transactions = []
    for match in _PATTERN_NEW.finditer(text):
        ref, date, time, description, amount_str, balance_str = match.groups()
        amount = float(amount_str.replace(",", ""))
        balance = float(balance_str.replace(",", ""))
        tx_type = "in" if amount >= 0 else "out"
        transactions.append({
            "date": date,
            "time": time,
            "ref": ref,
            "description": description.strip(),
            "amount": abs(amount),
            "balance": balance,
            "type": tx_type,
            "category": _categorise(description, tx_type),
        })
    return transactions


def _extract_old_format(text: str) -> List[Dict]:
    transactions = []
    for match in _PATTERN_OLD.finditer(text):
        date, time, ref, description, amount_str, balance_str = match.groups()
        amount = float(amount_str.replace(",", ""))
        balance = float(balance_str.replace(",", ""))
        tx_type = _infer_type_from_description(description)
        transactions.append({
            "date": _normalise_date(date),
            "time": time,
            "ref": ref,
            "description": description.strip(),
            "amount": amount,
            "balance": balance,
            "type": tx_type,
            "category": _categorise(description, tx_type),
        })
    return transactions


def _infer_type_from_description(description: str) -> str:
    desc = description.lower()
    for kw in ["received from", "money in", "reversal", "deposit", "credit"]:
        if kw in desc:
            return "in"
    return "out"


def _categorise(description: str, tx_type: str) -> str:
    if tx_type == "in":
        return "Money In"
    desc = description.lower()
    for category, keywords in CATEGORY_PATTERNS.items():
        if category == "Money In":
            continue
        for kw in keywords:
            if kw in desc:
                return category
    return "Other"


def _normalise_date(date_str: str) -> str:
    parts = date_str.split("/")
    if len(parts) == 3:
        return f"{parts[2]}-{parts[1]}-{parts[0]}"
    return date_str
