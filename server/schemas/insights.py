from marshmallow import Schema, fields


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
    used            = fields.Bool()
    total_borrowed  = fields.Float()
    total_repaid    = fields.Float()
    net_outstanding = fields.Float()
    borrow_count    = fields.Int()
    repay_count     = fields.Int()


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
