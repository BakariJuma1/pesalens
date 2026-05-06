from marshmallow import Schema, fields


class TransactionSchema(Schema):
    date        = fields.Str()
    time        = fields.Str()
    description = fields.Str()
    amount      = fields.Float()
    balance     = fields.Float()
    ref         = fields.Str()
    type        = fields.Str()
    category    = fields.Str()


class CategorySchema(Schema):
    count = fields.Int()
    total = fields.Float()


class MonthlySchema(Schema):
    total_in  = fields.Float()
    total_out = fields.Float()
    count     = fields.Int()


class SummarySchema(Schema):
    total_transactions = fields.Int()
    total_in           = fields.Float()
    total_out          = fields.Float()
    net                = fields.Float()
    savings_rate       = fields.Float()


class TopExpenseSchema(Schema):
    description = fields.Str()
    amount      = fields.Float()
    date        = fields.Str()


class TopRecipientSchema(Schema):
    name  = fields.Str()
    total = fields.Float()
    count = fields.Int()


class DayOfWeekSchema(Schema):
    day   = fields.Str()
    total = fields.Float()
    count = fields.Int()


class RecurringPaymentSchema(Schema):
    description = fields.Str()
    count       = fields.Int()
    avg_amount  = fields.Float()
    total       = fields.Float()
    months      = fields.Int()


class BalancePointSchema(Schema):
    date    = fields.Str()
    balance = fields.Float()


class WithdrawalSummarySchema(Schema):
    total_withdrawn  = fields.Float()
    total_digital    = fields.Float()
    withdrawal_count = fields.Int()
    cash_percentage  = fields.Float()


class PaydayInfoSchema(Schema):
    payday_date      = fields.Str()
    payday_amount    = fields.Float()
    week_spend_after = fields.Float()
    velocity_pct     = fields.Float()


class MerchantSchema(Schema):
    name     = fields.Str()
    total    = fields.Float()
    count    = fields.Int()
    category = fields.Str()


class SendFrequencySchema(Schema):
    name  = fields.Str()
    count = fields.Int()
    total = fields.Float()


class FulizaUsageSchema(Schema):
    used             = fields.Bool()
    total_borrowed   = fields.Float()
    total_repaid     = fields.Float()
    net_outstanding  = fields.Float()
    borrow_count     = fields.Int()
    repay_count      = fields.Int()


class IncomeSourceSchema(Schema):
    name  = fields.Str()
    total = fields.Float()
    count = fields.Int()


class HealthScoreComponentSchema(Schema):
    label     = fields.Str()
    score     = fields.Int()
    max_score = fields.Int()
    note      = fields.Str()


class HealthScoreSchema(Schema):
    score      = fields.Int()
    label      = fields.Str()
    components = fields.List(fields.Nested(HealthScoreComponentSchema))


class AnalysisResponseSchema(Schema):
    success        = fields.Bool()
    summary        = fields.Nested(SummarySchema)
    categories     = fields.Dict(keys=fields.Str(), values=fields.Nested(CategorySchema))
    monthly        = fields.Dict(keys=fields.Str(), values=fields.Nested(MonthlySchema))
    transactions   = fields.List(fields.Nested(TransactionSchema))
    ai_analysis    = fields.Str()
    top_expenses   = fields.List(fields.Nested(TopExpenseSchema))
    top_recipients   = fields.List(fields.Nested(TopRecipientSchema))
    pochi_recipients = fields.List(fields.Nested(TopRecipientSchema))
    parse_method   = fields.Str()
    error          = fields.Str(dump_default=None)

    day_of_week        = fields.List(fields.Nested(DayOfWeekSchema))
    recurring_payments = fields.List(fields.Nested(RecurringPaymentSchema))
    balance_timeline   = fields.List(fields.Nested(BalancePointSchema))
    withdrawal_summary = fields.Nested(WithdrawalSummarySchema)
    payday_info          = fields.Nested(PaydayInfoSchema, dump_default=None)
    top_merchants        = fields.List(fields.Nested(MerchantSchema))
    send_money_frequency = fields.List(fields.Nested(SendFrequencySchema))
    fuliza_usage      = fields.Nested(FulizaUsageSchema, dump_default=None)
    income_breakdown  = fields.List(fields.Nested(IncomeSourceSchema))
    health_score      = fields.Nested(HealthScoreSchema, dump_default=None)
