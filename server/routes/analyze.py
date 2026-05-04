from flask import Blueprint, request, jsonify
from extensions import limiter
from schemas.analysis import AnalysisResponseSchema
from service.analyzer import analyze_statement

analyze_bp = Blueprint("analyze", __name__)

_response_schema = AnalysisResponseSchema()


@analyze_bp.route("/analyze", methods=["POST"])
@limiter.limit("5 per hour")
def analyze():
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file provided"}), 400

    file = request.files["file"]

    if not file.filename:
        return jsonify({"success": False, "error": "No file selected"}), 400

    if file.content_type not in ("application/pdf", "application/octet-stream"):
        return jsonify({"success": False, "error": "File must be a PDF"}), 400

    pdf_bytes = file.read()

    if len(pdf_bytes) == 0:
        return jsonify({"success": False, "error": "Uploaded file is empty"}), 400

    password = request.form.get("password", "").strip()

    try:
        result = analyze_statement(pdf_bytes, password=password)
        return jsonify(_response_schema.dump(result))
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 422
    except Exception:
        return jsonify({
            "success": False,
            "error": "We couldn't read this file — make sure it's an M-Pesa PDF from Safaricom.",
        }), 500


@analyze_bp.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({"success": False, "error": "Slow down — try again in an hour"}), 429
