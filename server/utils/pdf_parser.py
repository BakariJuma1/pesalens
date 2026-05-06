import io
from typing import List, Dict, Tuple

from utils.parser_table import _extract_via_tables
from utils.parser_text import _extract_new_format, _extract_old_format


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
