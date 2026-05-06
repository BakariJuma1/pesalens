from models.categories import CATEGORY_PATTERNS


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


def _infer_type_from_description(description: str) -> str:
    desc = description.lower()
    for kw in ["received from", "money in", "reversal", "deposit", "credit"]:
        if kw in desc:
            return "in"
    return "out"
