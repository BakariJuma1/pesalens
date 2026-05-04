from flask import Blueprint, request, jsonify
from utils.pdf_parser import parse_pdf
import io, pdfplumber

debug_bp = Blueprint("debug", __name__)


@debug_bp.route("/debug-pdf", methods=["POST"])
def debug_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file"}), 400

    file = request.files["file"]
    password = request.form.get("password", "").strip()
    pdf_bytes = file.read()

    open_kwargs = {"password": password} if password else {}

    pages = []
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes), **open_kwargs) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                pages.append({"page": i + 1, "text": text[:2000]})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    return jsonify({"pages": pages})
