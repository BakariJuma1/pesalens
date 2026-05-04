from marshmallow import Schema, fields


class TransactionSchema(Schema):
    date = fields.Str()
    time = fields.Str()
    description = fields.Str()
    amount = fields.Float()
    balance = fields.Float()
    ref = fields.Str()
    type = fields.Str()      # 'in' or 'out'
    category = fields.Str()


class CategorySchema(Schema):
    count = fields.Int()
    total = fields.Float()


class MonthlySchema(Schema):
    total_in = fields.Float()
    total_out = fields.Float()
    count = fields.Int()


class SummarySchema(Schema):
    total_transactions = fields.Int()
    total_in = fields.Float()
    total_out = fields.Float()
    net = fields.Float()
    savings_rate = fields.Float()


class TopExpenseSchema(Schema):
    description = fields.Str()
    amount = fields.Float()
    date = fields.Str()


class TopRecipientSchema(Schema):
    name = fields.Str()
    total = fields.Float()
    count = fields.Int()


class AnalysisResponseSchema(Schema):
    success = fields.Bool()
    summary = fields.Nested(SummarySchema)
    categories = fields.Dict(keys=fields.Str(), values=fields.Nested(CategorySchema))
    monthly = fields.Dict(keys=fields.Str(), values=fields.Nested(MonthlySchema))
    transactions = fields.List(fields.Nested(TransactionSchema))
    ai_analysis = fields.Str()
    top_expenses = fields.List(fields.Nested(TopExpenseSchema))
    top_recipients = fields.List(fields.Nested(TopRecipientSchema))
    parse_method = fields.Str()
    error = fields.Str(dump_default=None)
