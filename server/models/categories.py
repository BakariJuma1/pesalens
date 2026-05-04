CATEGORIES = [
    "Send Money",
    "Pay Bill",
    "Buy Goods",
    "Airtime",
    "Withdraw",
    "Deposit",
    "Money In",
    "Other",
]

# Keywords used to classify transactions into categories
CATEGORY_PATTERNS = {
    "Send Money": ["send money", "transfer to", "sent to"],
    "Pay Bill": ["pay bill", "paybill", "business no", "account no"],
    "Buy Goods": ["buy goods", "merchant", "till no", "purchase"],
    "Airtime": ["airtime", "bundle", "data bundle", "safaricom"],
    "Withdraw": ["withdraw", "agent", "cash out", "atm"],
    "Deposit": ["deposit", "cash in"],
    "Money In": ["received from", "money in", "credit"],
}
