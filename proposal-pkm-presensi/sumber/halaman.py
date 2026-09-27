"""Mencari nomor halaman setiap entri daftar isi/gambar/tabel dari PDF hasil render.

Pemakaian: python3 halaman.py proposal.pdf entri.json halaman.json
"""
import json
import re
import sys

import pymupdf

ROMAWI = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii']


def norm(t):
    return re.sub(r'\s+', ' ', t).strip()


pdf, entri_path, out_path = sys.argv[1:4]
doc = pymupdf.open(pdf)
# buang nomor halaman di kepala halaman (angka di baris pertama)
teks = [re.sub(r'^\d+ ', '', norm(p.get_text())) for p in doc]
data = json.load(open(entri_path))

# halaman PDF (0-based) awal bagian depan dan bagian inti
awal_depan = next(i for i, t in enumerate(teks) if t.startswith('DAFTAR ISI'))
awal_inti = next(i for i, t in enumerate(teks) if t.startswith('BAB 1. PENDAHULUAN'))

hasil = {}
for j, judul in enumerate(data['depan']):
    idx = next(i for i in range(awal_depan, awal_inti) if teks[i].startswith(judul))
    hasil[judul] = ROMAWI[idx - awal_depan]

cari_dari = awal_inti
for e in data['entries']:
    kunci = norm(e)[:60]
    for i in range(awal_inti, len(teks)):
        if kunci in teks[i]:
            hasil[e] = str(i - awal_inti + 1)
            break
    else:
        print('tidak ditemukan:', e, file=sys.stderr)
lampiran1 = next(e for e in data['entries'] if e.startswith('Lampiran 1.'))
hasil['LAMPIRAN'] = hasil[lampiran1]
json.dump(hasil, open(out_path, 'w'), ensure_ascii=False, indent=1)
akhir_pustaka = next(i for i in range(awal_inti, len(teks)) if teks[i].startswith('Lampiran 1.')) - awal_inti
print(f'bagian inti (Bab 1 sampai Daftar Pustaka): {akhir_pustaka} halaman')
