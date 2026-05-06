from marshmallow import Schema, fields

from schemas.transactions import (
    TransactionSchema, CategorySchema, MonthlySchema,
    SummarySchema, TopExpenseSchema, TopRecipientSchema,
)
from schemas.insights import (
    DayOfWeekSchema, RecurringPaymentSchema, BalancePointSchema,
    WithdrawalSummarySchema, PaydayInfoSchema, MerchantSchema,
    SendFrequencySchema, FulizaUsageSchema, IncomeSourceSchema, HealthScoreSchema,
)


class AnalysisResponseSchema(Schema):
    success          = fields.Bool()
    summary          = fields.Nested(SummarySchema)
    categories       = fields.Dict(keys=fields.Str(), values=fields.Nested(CategorySchema))
    monthly          = fields.Dict(keys=fields.Str(), values=fields.Nested(MonthlySchema))
    transactions     = fields.List(fields.Nested(TransactionSchema))
    ai_analysis      = fields.Str()
    top_expenses     = fields.List(fields.Nested(TopExpenseSchema))
    top_recipients   = fields.List(fields.Nested(TopRecipientSchema))
    pochi_recipients = fields.List(fields.Nested(TopRecipientSchema))
    parse_method     = fields.Str()
    error            = fields.Str(dump_default=None)

    day_of_week          = fields.List(fields.Nested(DayOfWeekSchema))
    recurring_payments   = fields.List(fields.Nested(RecurringPaymentSchema))
    balance_timeline     = fields.List(fields.Nested(BalancePointSchema))
    withdrawal_summary   = fields.Nested(WithdrawalSummarySchema)
    payday_info          = fields.Nested(PaydayInfoSchema, dump_default=None)
    top_merchants        = fields.List(fields.Nested(MerchantSchema))
    send_money_frequency = fields.List(fields.Nested(SendFrequencySchema))
    fuliza_usage         = fields.Nested(FulizaUsageSchema, dump_default=None)
    income_breakdown     = fields.List(fields.Nested(IncomeSourceSchema))
    health_score         = fields.Nested(HealthScoreSchema, dump_default=None)
