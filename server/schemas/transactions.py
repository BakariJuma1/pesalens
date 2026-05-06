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
