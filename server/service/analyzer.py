from typing import Dict

from utils.pdf_parser import parse_pdf
from service.gemini import generate_analysis
from service.computations.summary import (
    _compute_summary, _compute_categories, _compute_monthly,
    _compute_top_expenses, _compute_balance_trend, _compute_avg_daily_spend,
)
from service.computations.patterns import (
    _compute_day_of_week, _detect_recurring, _compute_balance_timeline,
    _compute_withdrawal_summary, _detect_payday,
)
from service.computations.merchants import _compute_top_merchants
from service.computations.recipients import (
    _compute_top_recipients, _compute_pochi_recipients, _compute_send_money_frequency,
)
from service.computations.health import (
    _detect_fuliza, _compute_income_breakdown, _compute_health_score,
)


def analyze_statement(pdf_bytes: bytes, password: str = "") -> Dict:
    transactions, parse_method = parse_pdf(pdf_bytes, password=password)

    if len(transactions) < 5:
        raise ValueError(
            "Not enough transactions to analyse. Try uploading a full monthly statement."
        )

    summary          = _compute_summary(transactions)
    categories       = _compute_categories(transactions)
    monthly          = _compute_monthly(transactions)
    top_expenses     = _compute_top_expenses(transactions)
    balance_trend    = _compute_balance_trend(transactions)
    avg_daily_spend  = _compute_avg_daily_spend(summary, transactions)
    top_recipients   = _compute_top_recipients(transactions)
    pochi_recipients = _compute_pochi_recipients(transactions)

    day_of_week          = _compute_day_of_week(transactions)
    recurring_payments   = _detect_recurring(transactions)
    balance_timeline     = _compute_balance_timeline(transactions)
    withdrawal_summary   = _compute_withdrawal_summary(summary, transactions)
    payday_info          = _detect_payday(transactions)
    top_merchants        = _compute_top_merchants(transactions)
    send_money_frequency = _compute_send_money_frequency(transactions)

    fuliza_usage     = _detect_fuliza(transactions)
    income_breakdown = _compute_income_breakdown(transactions)
    health_score     = _compute_health_score(
        summary, balance_trend, payday_info, withdrawal_summary, fuliza_usage
    )

    ai_analysis = generate_analysis(
        summary, categories, top_expenses,
        balance_trend=balance_trend,
        avg_daily_spend=avg_daily_spend,
        recurring_payments=recurring_payments,
        payday_info=payday_info,
        withdrawal_summary=withdrawal_summary,
        fuliza_usage=fuliza_usage,
    )

    return {
        "success":             True,
        "summary":             summary,
        "categories":          categories,
        "monthly":             monthly,
        "transactions":        transactions[:100],
        "ai_analysis":         ai_analysis,
        "top_expenses":        top_expenses,
        "top_recipients":      top_recipients,
        "pochi_recipients":    pochi_recipients,
        "parse_method":        parse_method,
        "day_of_week":         day_of_week,
        "recurring_payments":  recurring_payments,
        "balance_timeline":    balance_timeline,
        "withdrawal_summary":  withdrawal_summary,
        "payday_info":         payday_info,
        "top_merchants":       top_merchants,
        "send_money_frequency": send_money_frequency,
        "fuliza_usage":        fuliza_usage,
        "income_breakdown":    income_breakdown,
        "health_score":        health_score,
    }
