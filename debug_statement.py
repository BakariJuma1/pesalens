import sys
import io
import pdfplumber

pdf_path = sys.argv[1] if len(sys.argv) > 1 else "/home/bakari/Downloads/statement.pdf"
password = sys.argv[2] if len(sys.argv) > 2 else ""

open_kwargs = {"password": password} if password else {}

print(f"Opening: {pdf_path}")
print(f"Password: {'(provided)' if password else '(none)'}\n")

with pdfplumber.open(pdf_path, **open_kwargs) as pdf:
    print(f"Pages: {len(pdf.pages)}\n")
    for i, page in enumerate(pdf.pages[:3]):  # first 3 pages only
        text = page.extract_text() or "(no text extracted)"
        print(f"{'='*60}")
        print(f"PAGE {i+1}")
        print(f"{'='*60}")
        print(text[:3000])
        print()
