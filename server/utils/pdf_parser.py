import io
import re
from typing import List, Dict, Tuple, Optional

from models.categories import CATEGORY_PATTERNS

_RECEIPT_RE = re.compile(r'^[A-Z0-9]{6,}$')
_AMOUNT_RE = re.compile(r'^[\d,]+\.\d{2}$')
_DATE_TIME_RE = re.compile(r'(\d{2}/\d{2}/\d{4})\s+(\d{2}:\d{2}:\d{2})')
_DATE_NEW_RE = re.compile(r'(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})')

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


def parse_pdf(pdf_bytes: bytes, password: str = "") -> Tuple[List[Dict], str]:
    open_kwargs = {"password": password} if password else {}

    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(pdf_bytes), **open_kwargs) as pdf:
            transactions = _extract_via_tables(pdf)
            if len(transactions) >= 5:
                return transactions, "regex"

            pages_text = []
            for page in pdf.pages:
                try:
                    text = page.extract_text(x_tolerance=3, y_tolerance=3) or ""
                except Exception:
                    text = page.extract_text() or ""
                pages_text.append(text)
                page.flush_cache()

    except Exception as exc:
        err = str(exc).lower()
        if "password" in err or "encrypt" in err or "decrypt" in err:
            raise ValueError(
                "This PDF is password-protected. Enter the password Safaricom sent you via SMS."
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


def _extract_via_tables(pdf) -> List[Dict]:
    transactions = []
    for page in pdf.pages:
        try:
            tables = page.extract_tables()
        except Exception:
            continue
        for table in tables:
            for row in table:
                tx = _parse_table_row(row)
                if tx:
                    transactions.append(tx)
    return transactions


def _parse_table_row(row) -> Optional[Dict]:
    if not row:
        return None

    cells = [str(c or "").strip() for c in row]

    receipt = next((c for c in cells if _RECEIPT_RE.match(c)), None)
    if not receipt:
        return None

    receipt_idx = cells.index(receipt)

    date_str = None
    time_str = None
    for cell in cells[receipt_idx:]:
        m = _DATE_TIME_RE.search(cell)
        if m:
            date_str = _normalise_date(m.group(1))
            time_str = m.group(2)
            break
        m2 = _DATE_NEW_RE.search(cell)
        if m2:
            date_str = m2.group(1)
            time_str = m2.group(2)
            break

    if not date_str:
        return None

    numeric = [(i, c) for i, c in enumerate(cells) if _AMOUNT_RE.match(c.replace(",", ""))]
    if len(numeric) < 2:
        return None

    balance_str = numeric[-1][1]
    balance = float(balance_str.replace(",", ""))

    # If 3+ numeric cells: [..., paid_in, withdrawn, balance]
    amount = 0.0
    tx_type = "out"
    if len(numeric) >= 3:
        paid_in_str = numeric[-3][1]
        withdrawn_str = numeric[-2][1]
        paid_in = float(paid_in_str.replace(",", "")) if paid_in_str else 0.0
        withdrawn = float(withdrawn_str.replace(",", "")) if withdrawn_str else 0.0
        if paid_in > 0:
            amount = paid_in
            tx_type = "in"
        elif withdrawn > 0:
            amount = withdrawn
            tx_type = "out"
        else:
            return None
    else:
        amount_str = numeric[-2][1]
        amount = float(amount_str.replace(",", ""))
        tx_type = "out"

    if amount <= 0:
        return None

    known_values = {receipt, balance_str}
    known_values.update(c for _, c in numeric)
    skip_words = {"completed", "failed", "cancelled", "receipt", "details",
                  "completion", "time", "status", "paid in", "withdrawn", "balance"}

    description = ""
    for cell in cells:
        if not cell:
            continue
        if cell in known_values:
            continue
        if cell.lower() in skip_words:
            continue
        if _RECEIPT_RE.match(cell):
            continue
        if _DATE_TIME_RE.search(cell) or _DATE_NEW_RE.search(cell):
            continue
        if _AMOUNT_RE.match(cell.replace(",", "")):
            continue
        if len(cell) > 5:
            description = cell
            break

    if not description:
        return None

    description = re.sub(r"\s+", " ", description).strip()

    if tx_type == "out":
        tx_type = _infer_type_from_description(description)

    return {
        "date": date_str,
        "time": time_str,
        "ref": receipt,
        "description": description,
        "amount": amount,
        "balance": balance,
        "type": tx_type,
        "category": _categorise(description, tx_type),
    }


def _extract_new_format(text: str) -> List[Dict]:
    transactions = []
    for match in _PATTERN_NEW.finditer(text):
        ref, date, time, description, amount_str, balance_str = match.groups()
        amount = float(amount_str.replace(",", ""))
        balance = float(balance_str.replace(",", ""))
        tx_type = "in" if amount >= 0 else "out"
        description = re.sub(r"\s+", " ", description).strip()
        transactions.append({
            "date": date,
            "time": time,
            "ref": ref,
            "description": description,
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
