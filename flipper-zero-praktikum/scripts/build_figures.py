#!/usr/bin/env python3
"""Buat gambar laporan praktikum Flipper Zero dari data/fakta-firmware.json dan rumus baku.

Pemakaian: build_figures.py <folder-proyek> [folder-font]
Keluaran: figures/*.png, figures/*.svg, data/hasil-perhitungan.json
"""
import json
import math
import sys
import textwrap
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib import font_manager as fm
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Polygon

root = Path(sys.argv[1])
font_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else None
data = json.loads((root / "data/fakta-firmware.json").read_text())
F = {f["id"]: f["nilai"] for f in data["fakta"]}
COMMIT = data["_meta"]["commit"][:7]
COMMIT_DATE = data["_meta"]["tanggal_commit"]
out_dir = root / "figures"
out_dir.mkdir(exist_ok=True)

SURFACE = "#fcfcfb"
INK = "#0b0b0b"
INK2 = "#52514e"
GRID = "#e1e0d9"
AXIS = "#c3c2b7"
CONTEXT = "#898781"
PANEL = "#f4f3ef"
SUBGHZ = "#2a78d6"
BLE = "#1baf7a"
BLE_TINT = "#a6dfc9"
BLE_WASH = "#d3efe4"
WIFI = "#eb6834"
RAMP = {"433": "#5598e7", "868": "#2a78d6", "2440": "#104281"}

SANS, MONO = "DejaVu Sans", "DejaVu Sans Mono"
if font_dir and font_dir.exists():
    for name in [
        "InstrumentSans-Regular.ttf",
        "InstrumentSans-Bold.ttf",
        "InstrumentSans-Italic.ttf",
        "IBMPlexMono-Regular.ttf",
        "IBMPlexMono-Bold.ttf",
    ]:
        p = font_dir / name
        if p.exists():
            fm.fontManager.addfont(str(p))
    SANS, MONO = "Instrument Sans", "IBM Plex Mono"

plt.rcParams.update(
    {
        "font.family": SANS,
        "svg.fonttype": "path",
        "figure.facecolor": SURFACE,
        "axes.facecolor": SURFACE,
        "savefig.facecolor": SURFACE,
        "axes.edgecolor": AXIS,
        "axes.linewidth": 1.0,
        "xtick.color": INK2,
        "ytick.color": INK2,
        "xtick.labelcolor": INK2,
        "ytick.labelcolor": INK2,
        "text.color": INK,
    }
)
DPI = 200
W = 10.0
M = 0.55


def num(x, nd=2):
    return f"{x:.{nd}f}".replace(".", ",")


def mhz(hz):
    return hz / 1e6


class Page:
    def __init__(self, height, title, subtitle, source):
        self.h = height
        self.fig = plt.figure(figsize=(W, height), dpi=DPI)
        y = height - 0.42
        for line in textwrap.wrap(title, 66):
            self.text(M, y, line, 17.5, "bold", va="top")
            y -= 0.33
        y -= 0.1
        for line in textwrap.wrap(subtitle, 118):
            self.text(M, y, line, 10.5, color=INK2, va="top")
            y -= 0.22
        self.top = y - 0.12
        lines = textwrap.wrap(source, 150)
        yb = 0.28
        for line in reversed(lines):
            self.text(M, yb, line, 8.2, color=INK2, va="bottom")
            yb += 0.16
        self.bottom = yb + 0.14

    def text(self, x_in, y_in, s, size=10, weight="normal", color=INK, family=None, ha="left", va="center", **kw):
        return self.fig.text(x_in / W, y_in / self.h, s, fontsize=size, fontweight=weight, color=color, fontfamily=family or SANS, ha=ha, va=va, **kw)

    def width_in(self, t):
        self.fig.canvas.draw()
        return t.get_window_extent().width / DPI

    def text2(self, x_in, y_in, bold, regular, size=10.5, size2=9.5, gap=0.12, va="center"):
        t = self.text(x_in, y_in, bold, size, "bold", va=va)
        w = self.width_in(t)
        self.text(x_in + w + gap, y_in, regular, size2, color=INK2, va=va)

    def axes(self, left, bottom, width, height):
        return self.fig.add_axes([left / W, bottom / self.h, width / W, height / self.h])

    def save(self, name):
        self.fig.savefig(out_dir / f"{name}.png", dpi=DPI)
        self.fig.savefig(out_dir / f"{name}.svg")
        plt.close(self.fig)
        print("ok", name)


def style_axes(ax, grid_x=True, grid_y=False):
    for s in ("top", "right", "left"):
        ax.spines[s].set_visible(False)
    ax.spines["bottom"].set_color(AXIS)
    ax.tick_params(axis="both", length=0, labelsize=9.5, pad=6)
    ax.set_axisbelow(True)
    if grid_x:
        ax.grid(axis="x", color=GRID, linewidth=0.8)
    if grid_y:
        ax.grid(axis="y", color=GRID, linewidth=0.8)


def rbar(ax, x0, x1, yc, h, color, r_px=3.0, z=3, alpha=1.0):
    bb = ax.get_position()
    fig = ax.figure
    sx = bb.width * fig.get_figwidth() * fig.dpi / (ax.get_xlim()[1] - ax.get_xlim()[0])
    sy = bb.height * fig.get_figheight() * fig.dpi / abs(ax.get_ylim()[1] - ax.get_ylim()[0])
    rx = min(r_px / sx, (x1 - x0) / 2.2)
    ax.add_patch(
        FancyBboxPatch(
            (x0, yc - h / 2),
            x1 - x0,
            h,
            boxstyle=f"round,pad=0,rounding_size={rx}",
            mutation_aspect=sx / sy,
            facecolor=color,
            edgecolor="none",
            alpha=alpha,
            zorder=z,
        )
    )


def legend_row(page, y_in, items):
    x = M
    for kind, color, label in items:
        if kind in ("bar", "outline"):
            page.fig.patches.append(
                FancyBboxPatch(
                    (x / W, (y_in - 0.06) / page.h),
                    0.26 / W,
                    0.12 / page.h,
                    boxstyle="round,pad=0,rounding_size=0.002",
                    transform=page.fig.transFigure,
                    facecolor=color if kind == "bar" else "none",
                    edgecolor="none" if kind == "bar" else color,
                    linewidth=1.3,
                )
            )
            x += 0.36
        else:
            page.fig.lines.append(
                plt.Line2D(
                    [(x + 0.08) / W],
                    [y_in / page.h],
                    transform=page.fig.transFigure,
                    marker="o",
                    markersize=6.5,
                    color=color,
                    markeredgecolor=SURFACE,
                    markeredgewidth=1.5,
                    linestyle="none",
                )
            )
            x += 0.26
        t = page.text(x, y_in, label, 9.5, color=INK2)
        x += page.width_in(t) + 0.32


# ---------------------------------------------------------------------------
# Gambar 1: band Sub-GHz dan pembatasan region
# ---------------------------------------------------------------------------
def fig_subghz_regions():
    valid = [[mhz(a), mhz(b)] for a, b in F["subghz_band_valid"]]
    regions = F["region_bands"]
    default_mhz = mhz(F["subghz_default_frequencies"]["default_hz"])
    freq_list = [mhz(f) for f in F["subghz_default_frequencies"]["daftar_hz"]]
    pad = 3.0
    windows = [(v[0] - pad, v[1] + pad) for v in valid]
    ticks = [[300, 320, 340], [390, 420, 450], [800, 850, 900]]
    pg = Page(
        7.0,
        "Firmware hanya membuka jendela sempit untuk transmisi",
        "Radio menerima tiga band, tetapi setiap region hanya membuka beberapa jendela untuk memancar. Di luar jendela, "
        "firmware menaruh radio dalam mode terima saja. Batas daya 12 dBm dan duty cycle 50% sama di semua region.",
        f"Sumber: furi_hal_subghz.c dan furi_hal_region.c, flipperzero-firmware commit {COMMIT} ({COMMIT_DATE}); lib/subghz/subghz_setting.c untuk "
        "frekuensi bawaan. Region Indonesia tidak ada di kode; lihat Region Information di aplikasi Sub-GHz untuk region unit Anda.",
    )
    legend_row(pg, pg.top - 0.05, [("bar", CONTEXT, "Rentang yang bisa diterima radio"), ("bar", SUBGHZ, "Transmisi diizinkan firmware"), ("dot", INK, "Frekuensi bawaan aplikasi")])
    rows = [
        ("Kemampuan radio", "CC1101, tiga band", "hw"),
        ("Region 00", "tanpa batas band", "00"),
        ("Region EU", "Eropa dan Rusia", "EU"),
        ("Region US", "AS, Kanada, Australia", "US"),
        ("Region JP", "Jepang", "JP"),
        ("Frekuensi bawaan", "daftar di aplikasi", "def"),
    ]
    left_axes, gap = 2.55, 0.28
    total_w = W - left_axes - 0.45 - 2 * gap
    spans = [b - a for a, b in windows]
    ax_bottom = pg.bottom + 0.75
    ax_h = pg.top - 0.75 - ax_bottom
    axs, x = [], left_axes
    for (a, b), sp, tk, v in zip(windows, spans, ticks, valid):
        w = total_w * sp / sum(spans)
        ax = pg.axes(x, ax_bottom, w, ax_h)
        ax.set_xlim(a, b)
        ax.set_ylim(-0.55, 5.55)
        style_axes(ax)
        ax.set_yticks([])
        ax.set_xticks(tk)
        axs.append(ax)
        pg.text(x, ax_bottom + ax_h + 0.12, f"{v[0]:.0f}-{v[1]:.0f} MHz", 10, "bold", INK2, va="bottom")
        x += w + gap
    for i, (name, sub, key) in enumerate(rows):
        yc = 5 - i
        y_in = ax_bottom + (yc + 0.55) / 6.1 * ax_h
        pg.text(M, y_in + 0.09, name, 10.5, "bold")
        pg.text(M, y_in - 0.13, sub, 9, color=INK2)
        for ax, (a, b) in zip(axs, windows):
            if key == "hw":
                for s, e in valid:
                    lo, hi = max(s, a), min(e, b)
                    if hi > lo:
                        rbar(ax, lo, hi, yc, 0.36, CONTEXT)
            elif key == "def":
                for f in freq_list:
                    if a <= f <= b:
                        d = abs(f - default_mhz) < 1e-6
                        ax.plot([f], [yc], marker="o", markersize=8.5 if d else 5, color=INK if d else SUBGHZ, markeredgecolor=SURFACE, markeredgewidth=1.5, zorder=7 if d else 5, linestyle="none")
                        if d:
                            ax.text(f, yc + 0.34, "433,92 default", fontsize=8.5, color=INK, ha="center", va="bottom", fontfamily=MONO)
            else:
                for bd in regions[key]:
                    s, e = mhz(bd["start_hz"]), mhz(bd["end_hz"])
                    for vs, ve in valid:
                        lo, hi = max(s, vs, a), min(e, ve, b)
                        if hi > lo:
                            rbar(ax, lo, hi, yc, 0.36, SUBGHZ)
                            if key != "00" and (hi - lo) < 0.2 * (b - a):
                                near_right = hi > b - 0.12 * (b - a)
                                ax.text(hi if near_right else (lo + hi) / 2, yc + 0.3, f"{num(s)}-{num(e)}", fontsize=8.3, color=INK2, ha="right" if near_right else "center", va="bottom", fontfamily=MONO)
    pg.text(left_axes, pg.bottom + 0.14, "Frekuensi dalam MHz. Skala horizontal sama di ketiga panel, jadi lebar jendela bisa dibandingkan langsung.", 9, color=INK2)
    pg.save("fig-01-band-sub-ghz-per-region")


# ---------------------------------------------------------------------------
# Gambar 2: koeksistensi 2,4 GHz
# ---------------------------------------------------------------------------
def fig_coexistence():
    pg = Page(
        5.7,
        "Kanal iklan BLE ada di tepi dan celah antara Wi-Fi kanal 1, 6, 11",
        "Kanal Wi-Fi selebar 20 MHz dengan pusat 2412 + 5 x (n - 1) MHz. BLE punya 40 kanal berjarak 2 MHz mulai 2402 MHz. "
        "Kanal iklan 37, 38, dan 39 dipakai Flipper untuk mengumumkan diri sebelum pairing.",
        "Gambar dihitung dari rumus kanal IEEE 802.11 dan Bluetooth Core Specification (kanal iklan 37, 38, 39 di 2402, 2426, 2480 MHz; "
        "dikonfirmasi lewat ringkasan pencarian, spesifikasi asli tidak bisa dibuka). Bukan hasil pengukuran spektrum.",
    )
    legend_row(pg, pg.top - 0.05, [("bar", BLE, "BLE kanal iklan"), ("bar", BLE_TINT, "BLE kanal data"), ("outline", WIFI, "Wi-Fi kanal 1, 6, 11"), ("outline", CONTEXT, "Wi-Fi kanal lain")])
    left, right = 2.35, W - 0.5
    ax_bottom = pg.bottom + 0.75
    ax_h = pg.top - 0.5 - ax_bottom
    ax = pg.axes(left, ax_bottom, right - left, ax_h)
    ax.set_xlim(2394, 2490)
    ax.set_ylim(-0.1, 3.3)
    style_axes(ax)
    ax.set_yticks([])
    ax.set_xticks(range(2400, 2490, 10))
    for n in range(1, 14):
        c = 2412 + 5 * (n - 1)
        strong = n in (1, 6, 11)
        pts = [(c - 11, 2.1), (c - 10, 3.05), (c + 10, 3.05), (c + 11, 2.1)]
        if strong:
            ax.add_patch(Polygon(pts, closed=True, facecolor=WIFI, alpha=0.14, edgecolor="none", zorder=2))
        ax.add_patch(Polygon(pts, closed=False, facecolor="none", edgecolor=WIFI if strong else CONTEXT, linewidth=2.0 if strong else 0.8, zorder=3, joinstyle="round"))
        ax.text(c, 1.86, str(n), fontsize=9.5, fontweight="bold" if strong else "normal", color=INK if strong else INK2, ha="center", va="center")
    for k in range(40):
        f = 2402 + 2 * k
        adv = k in (0, 12, 39)
        h = 0.9 if adv else 0.5
        rbar(ax, f - 0.6, f + 0.6, h / 2, h, BLE if adv else BLE_TINT, r_px=2.0, z=4)
    for k, (n, fr) in {0: ("37", "2402"), 12: ("38", "2426"), 39: ("39", "2480")}.items():
        f = 2402 + 2 * k
        ax.text(f + (1.4 if k == 0 else 0), 1.0, f"kanal {n}\n{fr} MHz", fontsize=9.3, color=INK, ha="left" if k == 0 else "center", va="bottom", fontweight="bold", linespacing=1.15)
    for name, sub, yc in [("Wi-Fi 2,4 GHz", "13 kanal, lebar 20 MHz", 2.6), ("Bluetooth LE", "40 kanal, jarak 2 MHz", 0.45)]:
        y_in = ax_bottom + (yc + 0.1) / 3.4 * ax_h
        pg.text(M, y_in + 0.09, name, 10.5, "bold")
        pg.text(M, y_in - 0.13, sub, 9, color=INK2)
    pg.text(left, pg.bottom + 0.14, "Frekuensi tengah kanal dalam MHz.", 9, color=INK2)
    pg.save("fig-02-koeksistensi-2-4-ghz")


# ---------------------------------------------------------------------------
# Gambar 3: rugi lintasan ruang bebas
# ---------------------------------------------------------------------------
def fspl(d_m, f_mhz):
    return 20 * np.log10(d_m) + 20 * np.log10(f_mhz) - 27.55


def fig_fspl():
    d = np.logspace(0, 3, 300)
    series = [
        (433.92, "433,92 MHz", "Sub-GHz, default", RAMP["433"]),
        (868.35, "868,35 MHz", "Sub-GHz", RAMP["868"]),
        (2440.0, "2440 MHz", "BLE dan Wi-Fi", RAMP["2440"]),
    ]
    gap_db = 20 * math.log10(2440.0 / 433.92)
    gap_2 = 20 * math.log10(868.35 / 433.92)
    ratio = 10 ** (gap_db / 20)
    pg = Page(
        5.9,
        f"Pada jarak sama, sinyal 2,4 GHz kehilangan {num(gap_db, 1)} dB lebih banyak daripada 433,92 MHz",
        "Rugi lintasan ruang bebas: FSPL = 20 log10(d) + 20 log10(f) - 27,55, dengan d dalam meter dan f dalam MHz. "
        f"Selisih {num(gap_db, 1)} dB setara jangkauan ruang bebas sekitar {num(ratio, 1)} kali lebih pendek untuk anggaran daya yang sama.",
        "Perhitungan teoretis dengan rumus Friis, antena isotropik, tanpa dinding atau pantulan. Nilai nyata lebih buruk. "
        "Data hasil ukur praktikum perlu diplot terpisah di atas grafik ini.",
    )
    ax_left, ax_right = M + 0.65, W - 2.85
    ax_bottom, ax_top = pg.bottom + 0.5, pg.top - 0.1
    ax = pg.axes(ax_left, ax_bottom, ax_right - ax_left, ax_top - ax_bottom)
    style_axes(ax, grid_x=True, grid_y=True)
    ax.set_xscale("log")
    ax.set_xlim(1, 1000)
    ax.set_ylim(20, 105)
    ax.set_xticks([1, 10, 100, 1000])
    ax.set_xticklabels(["1 m", "10 m", "100 m", "1 km"])
    ax.set_yticks(range(20, 110, 20))
    ax.minorticks_off()
    ax.set_ylabel("Rugi lintasan (dB)", fontsize=9.5, color=INK2, labelpad=8)
    ax.plot([100, 100], [20, 105], color=INK2, linewidth=1.0, zorder=2)
    for f, lab, sub, col in series:
        ax.plot(d, fspl(d, f), color=col, linewidth=2.2, solid_capstyle="round", zorder=3)
        ax.plot([1000], [fspl(1000, f)], marker="o", markersize=7, color=col, markeredgecolor=SURFACE, markeredgewidth=2, zorder=4, clip_on=False)
        ax.plot([100], [fspl(100, f)], marker="o", markersize=7, color=col, markeredgecolor=SURFACE, markeredgewidth=2, zorder=5)
    ax.text(97, 22, "100 m", fontsize=9, color=INK2, ha="right", va="bottom")
    ax.text(150, 57, "Rugi lintasan pada 100 m", fontsize=9.5, fontweight="bold", color=INK, ha="left", va="center")
    for i, (f, lab, sub_, col) in enumerate(series[::-1]):
        yy = 51 - i * 5.6
        ax.plot([160], [yy], marker="o", markersize=7, color=col, markeredgecolor=SURFACE, markeredgewidth=1.6, zorder=6)
        ax.text(185, yy, f"{lab}: {num(fspl(100, f), 1)} dB", fontsize=9.5, color=INK, ha="left", va="center")
    h_in = ax_top - ax_bottom
    for f, lab, sub, col in series:
        y_in = ax_bottom + (fspl(1000, f) - 20) / 85 * h_in
        pg.text2(ax_right + 0.2, y_in, lab, sub, 10.5, 9)
    pg.save("fig-03-rugi-lintasan-ruang-bebas")
    return {"gap_2440_433": gap_db, "gap_868_433": gap_2, "range_ratio": ratio, "fspl_100m": {str(f): fspl(100, f) for f, *_ in series}}


# ---------------------------------------------------------------------------
# Gambar 4: laju data
# ---------------------------------------------------------------------------
def fig_data_rates():
    rows = [
        ("Sub-GHz (CC1101)", "modulasi OOK, FSK, MSK", 0.6, 500.0, SUBGHZ, "0,6 kBaud", "500 kBaud", None),
        ("Bluetooth LE", "PHY LE Coded, 1M, 2M", 125.0, 2000.0, BLE, "125 kbit/s", "2 Mbit/s", [125, 500, 1000, 2000]),
        ("Wi-Fi 2,4 GHz (ESP32-S2)", "802.11b sampai 802.11n", 1000.0, 150000.0, WIFI, "1 Mbit/s", "150 Mbit/s", None),
    ]
    orders = math.log10(150000.0 / 0.6)
    pg = Page(
        4.9,
        f"Laju data tiga teknologi berjarak lebih dari {int(orders)} orde besaran",
        "Laju simbol radio, bukan throughput aplikasi. Satu report HID keyboard hanya 8 byte dan report mouse 4 byte, jauh di bawah kapasitas BLE. "
        "Titik putih pada baris BLE menandai empat PHY: 125 kbit/s, 500 kbit/s, 1 Mbit/s, 2 Mbit/s.",
        "CC1101 dan ESP32-S2: lembar data pabrikan (angka dikutip dari ringkasan hasil pencarian; halaman asli tidak bisa dibuka). "
        "BLE: Bluetooth Core Specification 5.x. Sumbu horizontal logaritmik.",
    )
    ax_bottom = pg.bottom + 0.45
    ax_top = pg.top - 0.1
    ax = pg.axes(2.9, ax_bottom, W - 2.9 - 0.7, ax_top - ax_bottom)
    style_axes(ax)
    ax.set_xscale("log")
    ax.set_xlim(0.3, 400000)
    ax.set_ylim(-0.6, 2.6)
    ax.set_yticks([])
    ax.set_xticks([1, 10, 100, 1000, 10000, 100000])
    ax.set_xticklabels(["1 kbit/s", "10", "100", "1 Mbit/s", "10", "100 Mbit/s"])
    ax.minorticks_off()
    for i, (name, sub, lo, hi, col, lo_l, hi_l, marks) in enumerate(rows):
        yc = 2 - i
        rbar(ax, lo, hi, yc, 0.34, col, r_px=4)
        for m in marks or []:
            ax.plot([m], [yc], marker="o", markersize=6, color=SURFACE, markeredgecolor=col, markeredgewidth=1.6, zorder=6, linestyle="none")
        ax.text(lo / 1.25, yc, lo_l, fontsize=9.5, color=INK, ha="right", va="center")
        ax.text(hi * 1.25, yc, hi_l, fontsize=9.5, color=INK, ha="left", va="center")
        y_in = ax_bottom + (yc + 0.6) / 3.2 * (ax_top - ax_bottom)
        pg.text(M, y_in + 0.09, name, 10.5, "bold")
        pg.text(M, y_in - 0.13, sub, 9, color=INK2)
    pg.save("fig-04-laju-data-teoretis")
    return orders


# ---------------------------------------------------------------------------
# Gambar 5: arsitektur
# ---------------------------------------------------------------------------
def fig_architecture():
    pg = Page(
        7.8,
        "Satu mikrokontroler dua inti, tiga jalur radio",
        "STM32WB55RG menjalankan aplikasi di Cortex-M4 dan tumpukan BLE di Cortex-M0+. Sub-GHz memakai chip CC1101 lewat SPI. "
        "Wi-Fi tidak ada di badan Flipper; ia datang dari papan ESP32-S2 lewat UART.",
        "Sumber: ble_glue/hw_ipcc.c, furi_hal_bt.c, furi_hal_subghz.c, documentation/ExpansionModules.md, documentation/devboard/ "
        f"(flipperzero-firmware commit {COMMIT}). Kotak kanan adalah perangkat milik sendiri yang dipakai di praktikum.",
    )
    ax = pg.axes(0, 0, W, pg.h)
    ax.set_xlim(0, W)
    ax.set_ylim(0, pg.h)
    ax.axis("off")

    def box(x, y, w, h, title, lines, edge, lw=2.0):
        ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0,rounding_size=0.07", facecolor=SURFACE, edgecolor=edge, linewidth=lw, zorder=3))
        ty = y + h - 0.22
        ax.text(x + 0.16, ty, title, fontsize=10.3, fontweight="bold", color=INK, ha="left", va="center", zorder=5)
        for i, line in enumerate(lines):
            ax.text(x + 0.16, ty - 0.27 - i * 0.2, line, fontsize=8.8, color=INK2, ha="left", va="center", zorder=5)

    def arrow(p, q, color, label=None, lp=None, both=True):
        ax.add_patch(FancyArrowPatch(p, q, arrowstyle="<|-|>" if both else "-|>", mutation_scale=12, color=color, linewidth=1.9, zorder=2, shrinkA=0, shrinkB=0))
        if label:
            ax.text(lp[0], lp[1], label, fontsize=8.6, color=INK, ha="center", va="bottom", zorder=6, linespacing=1.15)

    T = pg.top - 0.75
    hA, hB, gapv = 1.85, 1.0, 0.28
    yA = T - hA
    yB = yA - gapv - hB
    yC = yB - gapv - hB
    ax.add_patch(FancyBboxPatch((M, yC - 0.3), 4.6, (pg.top - 0.05) - (yC - 0.3), boxstyle="round,pad=0,rounding_size=0.1", facecolor=PANEL, edgecolor=AXIS, linewidth=1.2, zorder=1))
    ax.text(M + 0.2, pg.top - 0.32, "Flipper Zero", fontsize=12, fontweight="bold", color=INK, ha="left", va="center", zorder=5)

    m4x, m4w = M + 0.2, 1.7
    box(m4x, yC, m4w, T - yC, "Cortex-M4, 64 MHz", ["Firmware dan aplikasi", "", "hid_app: keyboard,", "mouse, media", "bad_usb: skrip lewat", "BLE atau USB", "subghz: baca, simpan,", "kirim sinyal", "RPC untuk aplikasi", "seluler"], edge=INK2, lw=1.6)
    rx0, rw = M + 2.55, 2.0
    box(rx0, yA, rw, hA, "Cortex-M0+", ["Koprosesor radio", "Tumpukan BLE:", "GAP, GATT, keamanan", "Daya TX 0 dBm"], edge=BLE)
    box(rx0, yB, rw, hB, "CC1101", ["Transceiver Sub-GHz", "300-928 MHz"], edge=SUBGHZ)
    box(rx0, yC, rw, hB, "Header GPIO", ["USART TX pin 13", "RX pin 14"], edge=INK2)
    for yy, lab in [(yA + hA / 2, "IPCC"), (yB + hB / 2, "SPI"), (yC + hB / 2, "UART")]:
        arrow((m4x + m4w, yy), (rx0, yy), INK2, lab, ((m4x + m4w + rx0) / 2, yy + 0.06))

    px0 = 6.7
    pw = W - px0 - 0.45
    ph = 0.85
    box(px0, T - ph, pw, ph, "Ponsel atau laptop", ["Pusat BLE, host HID"], edge=BLE)
    box(px0, yA, pw, ph, "Aplikasi Flipper seluler", ["BLE Serial, protokol RPC"], edge=BLE)
    box(px0, yB, pw, hB, "Perangkat 433 MHz sendiri", ["Remote atau sakelar milik pribadi"], edge=SUBGHZ)
    box(px0, yC, pw, hB, "Papan Wi-Fi ESP32-S2", ["2,4 GHz saja, tanpa Bluetooth", "AP bawaan: blackmagic"], edge=WIFI)
    x_in, x_out = rx0 + rw, px0
    mid = (x_in + x_out) / 2
    arrow((x_in, T - ph / 2), (x_out, T - ph / 2), BLE, "HID 0x1812\nnumeric comparison", (mid, T - ph / 2 + 0.06))
    arrow((x_in, yA + ph / 2), (x_out, yA + ph / 2), BLE, "GATT Serial\npasskey di Flipper", (mid, yA + ph / 2 + 0.06))
    arrow((x_in, yB + hB / 2), (x_out, yB + hB / 2), SUBGHZ, "RF Sub-GHz\nTX di band region", (mid, yB + hB / 2 + 0.06))
    arrow((x_in, yC + hB / 2), (x_out, yC + hB / 2), WIFI, "UART, lalu\nWi-Fi 2,4 GHz", (mid, yC + hB / 2 + 0.06), both=False)
    pg.save("fig-05-arsitektur-praktikum")


# ---------------------------------------------------------------------------
# Gambar 6: interval advertising
# ---------------------------------------------------------------------------
def fig_adv():
    fast = (F["ble_adv_fast_min"], F["ble_adv_fast_max"])
    low = (F["ble_adv_low_min"], F["ble_adv_low_max"])
    t_sw = F["ble_adv_switch"] / 1000
    lo_ratio, hi_ratio = low[0] / fast[1], low[1] / fast[0]
    ev_fast = 60000 / ((fast[0] + fast[1]) / 2)
    ev_low = 60000 / ((low[0] + low[1]) / 2)
    pg = Page(
        5.2,
        f"Setelah {int(t_sw)} detik, iklan BLE {int(lo_ratio)} sampai {int(hi_ratio)} kali lebih jarang",
        f"Selama {int(t_sw)} detik pertama iklan keluar tiap {fast[0]}-{fast[1]} ms (sekitar {int(round(ev_fast))} iklan per menit pada titik tengah). "
        f"Sesudahnya tiap 1.000-2.500 ms (sekitar {int(round(ev_low))} iklan per menit). Perangkat lain lebih lama menemukan Flipper di fase kedua.",
        f"Sumber: targets/f7/ble_glue/gap.c baris 15 dan 431-435, flipperzero-firmware commit {COMMIT}. Iklan berhenti hanya bila aplikasi menghentikannya "
        "atau ada sambungan. Nilai adalah konfigurasi, bukan hasil pengukuran.",
    )
    ax_bottom = pg.bottom + 0.75
    ax = pg.axes(M + 0.75, ax_bottom, W - 2 * M - 0.95, pg.top - 0.1 - ax_bottom)
    style_axes(ax, grid_x=False, grid_y=True)
    ax.set_yscale("log")
    ax.set_xlim(0, 180)
    ax.set_ylim(30, 4000)
    ax.set_yticks([100, 1000])
    ax.set_yticklabels(["100 ms", "1 s"])
    ax.minorticks_off()
    ticks = [0, 30, 60, 90, 120, 150, 180]
    ax.set_xticks(ticks)
    ax.set_xticklabels([f"{t} s" for t in ticks])
    ax.set_xlabel("Waktu sejak iklan dimulai", fontsize=9.5, color=INK2, labelpad=8, loc="left")
    for x0, x1, (a, b) in [(0, t_sw, fast), (t_sw, 180, low)]:
        ax.fill_between([x0, x1], [a, a], [b, b], color=BLE, alpha=0.22, linewidth=0, zorder=2)
        ax.plot([x0, x1], [a, a], color=BLE, linewidth=2.2, solid_capstyle="butt", zorder=4)
        ax.plot([x0, x1], [b, b], color=BLE, linewidth=2.2, solid_capstyle="butt", zorder=4)
    ax.plot([t_sw, t_sw], [30, 4000], color=INK2, linewidth=1.0, zorder=3)
    ax.text(t_sw - 1.8, 3300, "60 detik: timer pindah ke mode hemat daya", fontsize=9.3, color=INK, ha="right", va="center")
    ax.text(t_sw / 2, fast[1] * 1.25, f"{fast[0]}-{fast[1]} ms", fontsize=10.5, fontweight="bold", color=INK, ha="center", va="bottom")
    ax.text(t_sw / 2, fast[0] / 1.2, "mode cepat", fontsize=9.3, color=INK2, ha="center", va="top")
    ax.text((t_sw + 180) / 2, low[1] * 1.12, "1.000-2.500 ms", fontsize=10.5, fontweight="bold", color=INK, ha="center", va="bottom")
    ax.text((t_sw + 180) / 2, low[0] / 1.12, "mode hemat daya, berlanjut sampai ada sambungan", fontsize=9.3, color=INK2, ha="center", va="top")
    pg.save("fig-06-interval-iklan-ble")
    return {"lo_ratio": lo_ratio, "hi_ratio": hi_ratio, "ev_fast": ev_fast, "ev_low": ev_low}


# ---------------------------------------------------------------------------
# Gambar 7: anatomi report HID
# ---------------------------------------------------------------------------
def fig_hid():
    pg = Page(
        6.9,
        "Tiga report HID membawa semua kendali: keyboard, mouse, media",
        "Layanan GATT HID (UUID 0x1812) mengirim tiga jenis report lewat satu karakteristik Report. Keyboard hanya membawa "
        f"{F['hid_kb_max_keys']} tombol non-modifier sekaligus, jadi kombinasi lebih dari enam tombol tidak terkirim dalam satu report.",
        "Sumber: lib/ble_profile/extra_profiles/hid_profile.c (struct dan report map) dan extra_services/hid_service.c, "
        f"flipperzero-firmware commit {COMMIT}. Lebar sel sebanding dengan ukuran byte.",
    )
    ax = pg.axes(0, 0, W, pg.h)
    ax.set_xlim(0, W)
    ax.set_ylim(0, pg.h)
    ax.axis("off")
    byte_w, x0 = 0.82, 2.55
    rows = [
        ("Report ID 1", "Keyboard, 8 byte", [("mods", "modifier\n(8 bit)", 1), ("rsv", "cadangan", 1)] + [(f"key{i}", "kode\ntombol", 1) for i in range(1, 7)]),
        ("Report ID 2", "Mouse, 4 byte", [("btn", "3 tombol,\n5 bit kosong", 1), ("x", "int8\nrelatif", 1), ("y", "int8\nrelatif", 1), ("wheel", "int8\ngulir", 1)]),
        ("Report ID 3", "Consumer control, 2 byte", [("key", "uint16, satu tombol media", 2)]),
    ]
    y = pg.top - 0.55
    for title, sub, cells in rows:
        ax.text(M, y + 0.12, title, fontsize=10.8, fontweight="bold", color=INK, va="center", ha="left")
        ax.text(M, y - 0.12, sub, fontsize=9, color=INK2, va="center", ha="left")
        x = x0
        for name, typ, nb in cells:
            w = byte_w * nb - 0.06
            rsv = name == "rsv"
            ax.add_patch(FancyBboxPatch((x, y - 0.28), w, 0.56, boxstyle="round,pad=0,rounding_size=0.05", facecolor=PANEL if rsv else BLE_WASH, edgecolor=CONTEXT if rsv else BLE, linewidth=1.5, zorder=3))
            ax.text(x + w / 2, y, name, fontsize=10, color=INK, family=MONO, ha="center", va="center", zorder=5, fontweight="bold")
            ax.text(x + w / 2, y - 0.4, typ, fontsize=8.2, color=INK2, ha="center", va="top", zorder=5, linespacing=1.15)
            x += byte_w * nb
        y -= 1.4
    pg.save("fig-07-anatomi-report-hid")


# ---------------------------------------------------------------------------
# Gambar 8: angka kunci
# ---------------------------------------------------------------------------
def fig_stats():
    types = F["subghz_protocol_types"]
    tiles = [
        ("3", "", "band frekuensi yang diterima radio", "furi_hal_subghz.c", SUBGHZ),
        (str(sum(types.values())), "", f"entri protokol Sub-GHz: {types['static']} statis, {types['dynamic']} dinamis, {types['raw']} RAW", "lib/subghz/protocols", SUBGHZ),
        ("12", "dBm", "batas daya per region, duty cycle 50%", "furi_hal_region.c", SUBGHZ),
        (str(len(F["cc1101_presets"])), "", "set register preset modulasi CC1101", "cc1101_configs.c", SUBGHZ),
        ("0", "dBm", "daya transmisi BLE", "gap.c baris 353", BLE),
        (f"{F['ble_adv_fast_min']}-{F['ble_adv_fast_max']}", "ms", "interval iklan BLE, 60 detik pertama", "gap.c baris 431", BLE),
        (str(F["hid_kb_max_keys"]), "", "tombol keyboard sekaligus per report HID", "hid_profile.c baris 17", BLE),
        (str(F["ble_max_links"]), "", "sambungan BLE maksimum bersamaan", "app_conf.h baris 43", BLE),
    ]
    pg = Page(
        6.2,
        "Delapan angka kunci firmware Flipper Zero, dibaca dari kode",
        f"Biru menandai Sub-GHz dan aqua menandai BLE. Semua nilai adalah konfigurasi firmware (commit {COMMIT}, {COMMIT_DATE}), "
        "bukan hasil pengukuran daya atau jangkauan.",
        "Sumber: github.com/flipperdevices/flipperzero-firmware, cabang dev. Daftar lengkap dengan kutipan baris ada di data/fakta-firmware.json.",
    )
    ax = pg.axes(0, 0, W, pg.h)
    ax.set_xlim(0, W)
    ax.set_ylim(0, pg.h)
    ax.axis("off")
    colw = (W - 2 * M) / 4
    tile_h = (pg.top - pg.bottom - 0.1) / 2
    for i, (val, unit, label, src, col) in enumerate(tiles):
        r, c = divmod(i, 4)
        x = M + c * colw
        y = pg.top - r * tile_h
        ax.plot([x, x + colw - 0.25], [y, y], color=GRID, linewidth=1.0)
        ax.add_patch(FancyBboxPatch((x, y - 0.07), 0.42, 0.07, boxstyle="round,pad=0,rounding_size=0.02", facecolor=col, edgecolor="none"))
        t = ax.text(x, y - 0.55, val, fontsize=31, fontweight="bold", color=INK, ha="left", va="center")
        if unit:
            ax.text(x + pg.width_in(t) + 0.1, y - 0.63, unit, fontsize=13, color=INK2, ha="left", va="center")
        for j, line in enumerate(textwrap.wrap(label, 27)):
            ax.text(x, y - 0.98 - j * 0.19, line, fontsize=9.6, color=INK, ha="left", va="center")
        ax.text(x, y - 0.98 - 0.19 * 2 - 0.14, src, fontsize=7.8, color=INK2, family=MONO, ha="left", va="center")
    pg.save("fig-08-angka-kunci-firmware")


if __name__ == "__main__":
    fig_subghz_regions()
    fig_coexistence()
    derived = {"fspl": fig_fspl(), "laju_data_orde": fig_data_rates()}
    fig_architecture()
    derived["adv"] = fig_adv()
    fig_hid()
    fig_stats()
    (root / "data/hasil-perhitungan.json").write_text(json.dumps(derived, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps(derived, indent=2))
