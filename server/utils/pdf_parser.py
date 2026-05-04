import io
import re
from typing import List, Dict, Tuple

from models.categories import CATEGORY_PATTERNS


def parse_pdf(pdf_bytes: bytes, password: str = "") -> Tuple[List[Dict], str]:
    """Extract transactions from M-Pesa PDF. Returns (transactions, method)."""
    import pdfplumber
    import pdfminer.pdfdocument as pdfdoc
    import pdfminer.pdfparser as pdfparser

    open_kwargs = {"password": password} if password else {}

    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes), **open_kwargs) as pdf:
            pages_text = [page.extract_text() or "" for page in pdf.pages]
    except Exception as exc:
        err = str(exc).lower()
        if "password" in err or "encrypt" in err or "decrypt" in err:
            raise ValueError(
                "This PDF is password-protected. Enter the password Safaricom sent you via SMS (usually your ID number)."
            )
        raise

    full_text = "\n".join(pages_text)

    transactions = _extract_regex(full_text)
    if transactions:
        return transactions, "regex"

    # Gemini fallback — imported lazily to avoid hard dependency at startup
    from service.gemini import extract_transactions_ai
    transactions = extract_transactions_ai(full_text)
    return transactions, "ai"


def _extract_regex(text: str) -> List[Dict]:
    """
    M-Pesa statements typically have rows like:
    DD/MM/YYYY  HH:MM:SS  <Receipt>  <Description>  <Amount>  <Balance>
    This regex targets that layout. Returns empty list if no matches.
    """
    pattern = re.compile(
        r"(\d{2}/\d{2}/\d{4})\s+"          # date
        r"(\d{2}:\d{2}:\d{2})\s+"           # time
        r"([A-Z0-9]+)\s+"                    # receipt / ref
        r"(.+?)\s+"                          # description (non-greedy)
        r"([\d,]+\.\d{2})\s+"               # amount
        r"([\d,]+\.\d{2})",                  # balance
        re.MULTILINE,
    )

    transactions = []
    for match in pattern.finditer(text):
        date, time, ref, description, amount_str, balance_str = match.groups()
        amount = float(amount_str.replace(",", ""))
        balance = float(balance_str.replace(",", ""))
        tx_type = _infer_type(description)
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


def _infer_type(description: str) -> str:
    desc = description.lower()
    incoming_keywords = ["received from", "money in", "reversal", "deposit", "credit"]
    for kw in incoming_keywords:
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
    """Convert DD/MM/YYYY → YYYY-MM-DD."""
    parts = date_str.split("/")
    if len(parts) == 3:
        return f"{parts[2]}-{parts[1]}-{parts[0]}"
    return date_str
