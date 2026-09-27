#!/usr/bin/env bash
# Bangun ulang proposal: diagram -> docx (2 lintasan agar nomor halaman daftar isi benar) -> cek halaman.
# Kebutuhan: node + paket npm "docx" dan "playwright", LibreOffice Writer, Python + pymupdf.
set -euo pipefail
cd "$(dirname "$0")"
TMP=$(mktemp -d)
node render-diagram.js
node build.js
cp ../2026-09-27_proposal-pkm-kc-presensi_draft-ke-1.docx "$TMP/p.docx"
(cd "$TMP" && soffice --headless --convert-to pdf p.docx >/dev/null 2>&1)
python3 halaman.py "$TMP/p.pdf" entri.json halaman.json
node build.js halaman.json
cp ../2026-09-27_proposal-pkm-kc-presensi_draft-ke-1.docx "$TMP/p.docx"
(cd "$TMP" && soffice --headless --convert-to pdf p.docx >/dev/null 2>&1)
python3 halaman.py "$TMP/p.pdf" entri.json /dev/null
cp "$TMP/p.pdf" ../2026-09-27_proposal-pkm-kc-presensi_draft-ke-1.pdf
rm -rf "$TMP"
