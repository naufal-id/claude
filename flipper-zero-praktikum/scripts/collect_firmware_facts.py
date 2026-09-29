#!/usr/bin/env python3
"""Baca fakta teknis Flipper Zero langsung dari kode firmware resmi.

Pemakaian: collect_firmware_facts.py <path-clone-flipperzero-firmware> <berkas-keluaran.json>

Setiap fakta menyimpan berkas, nomor baris, dan kutipan baris asli sehingga
bisa dicek ulang tanpa mempercayai ringkasan pihak ketiga.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

repo = Path(sys.argv[1])
out = Path(sys.argv[2])


def git(*args):
    return subprocess.check_output(["git", "-C", str(repo), *args], text=True).strip()


def lines(rel):
    return (repo / rel).read_text(errors="replace").splitlines()


def find(rel, pattern, nth=0):
    hits = [(i + 1, l) for i, l in enumerate(lines(rel)) if re.search(pattern, l)]
    if len(hits) <= nth:
        raise SystemExit(f"tidak ketemu: {rel} /{pattern}/")
    return hits[nth]


facts = []


def fact(fid, pernyataan, nilai, rel, pattern, nth=0):
    no, text = find(rel, pattern, nth)
    facts.append(
        {
            "id": fid,
            "pernyataan": pernyataan,
            "nilai": nilai,
            "berkas": rel,
            "baris": no,
            "kutipan": text.strip(),
        }
    )


SUBGHZ = "targets/f7/furi_hal/furi_hal_subghz.c"
REGION = "targets/f7/furi_hal/furi_hal_region.c"
GAP = "targets/f7/ble_glue/gap.c"
HIDP = "lib/ble_profile/extra_profiles/hid_profile.c"

valid = re.search(
    r"value >= (\d+) && value <= (\d+)\)\s*&&\s*!\(value >= (\d+) && value <= (\d+)\)\s*&&\s*!\(value >= (\d+) && value <= (\d+)",
    (repo / SUBGHZ).read_text(),
)
band_valid_hz = [[int(valid.group(i)), int(valid.group(i + 1))] for i in (1, 3, 5)]
fact("subghz_band_valid", "Tiga band frekuensi yang diterima radio (Hz)", band_valid_hz, SUBGHZ, r"value >= 299999755")

region_src = (repo / REGION).read_text()
regions = {}
for m in re.finditer(r'\.country_code = "([^"]+)",\s*\.bands_count = (\d+),\s*\.bands = \{(.*?)\}\};', region_src, re.S):
    code, _, body = m.groups()
    bands = [
        {
            "start_hz": int(s),
            "end_hz": int(e),
            "power_limit_dbm": int(p),
            "duty_cycle_persen": int(d),
        }
        for s, e, p, d in re.findall(
            r"\.start = (\d+),\s*\.end = (\d+),\s*\.power_limit = (\d+),\s*\.duty_cycle = (\d+)", body
        )
    ]
    regions[code] = bands
facts.append(
    {
        "id": "region_bands",
        "pernyataan": "Band transmisi yang diizinkan per region statis",
        "nilai": regions,
        "berkas": REGION,
        "baris": find(REGION, r"furi_hal_region_zero")[0],
        "kutipan": "struktur FuriHalRegion (country_code, bands[start,end,power_limit,duty_cycle])",
    }
)

fact(
    "region_tx_gate",
    "Frekuensi di luar band region membuat radio hanya menerima (RX only)",
    "SubGhzRegulationOnlyRx",
    SUBGHZ,
    r"furi_hal_subghz\.regulation = SubGhzRegulationOnlyRx",
)

setting = lines("lib/subghz/subghz_setting.c")
start = next(i for i, l in enumerate(setting) if "subghz_frequency_list[]" in l)
freqs, default = [], None
for l in setting[start + 1 :]:
    m = re.match(r"\s*(\d+)(?: \| FREQUENCY_FLAG_DEFAULT)?,", l)
    if not m:
        if "}" in l:
            break
        continue
    hz = int(m.group(1))
    if hz == 0:
        break
    freqs.append(hz)
    if "FREQUENCY_FLAG_DEFAULT" in l:
        default = hz
facts.append(
    {
        "id": "subghz_default_frequencies",
        "pernyataan": "Daftar frekuensi bawaan aplikasi Sub-GHz dan frekuensi default",
        "nilai": {"daftar_hz": freqs, "default_hz": default},
        "berkas": "lib/subghz/subghz_setting.c",
        "baris": start + 1,
        "kutipan": "subghz_frequency_list[]",
    }
)

fact("ble_tx_power", "Daya TX BLE diset ke 0 dBm", 0, GAP, r"aci_hal_set_tx_power_level\(1, 0x19\)")
fact("ble_adv_fast_min", "Interval advertising cepat, minimum (ms, sesuai komentar kode)", 80, GAP, r"min_interval = 0x80;")
fact("ble_adv_fast_max", "Interval advertising cepat, maksimum (ms)", 100, GAP, r"max_interval = 0xa0;")
fact("ble_adv_low_min", "Interval advertising hemat daya, minimum (ms)", 1000, GAP, r"min_interval = 0x0640;")
fact("ble_adv_low_max", "Interval advertising hemat daya, maksimum (ms)", 2500, GAP, r"max_interval = 0x0fa0;")
fact("ble_adv_switch", "Pindah ke mode hemat daya setelah (ms)", 60000, GAP, r"#define INITIAL_ADV_TIMEOUT")
fact("ble_role", "Flipper berperan sebagai GAP Peripheral", "GAP_PERIPHERAL_ROLE", GAP, r"GAP_PERIPHERAL_ROLE")
fact("ble_adv_type", "Advertising connectable undirected", "ADV_IND", GAP, r"ADV_IND,")
fact("ble_sc", "LE Secure Connections opsional", "SC_PAIRING_OPTIONAL", "targets/f7/ble_glue/app_conf.h", r"CFG_SC_SUPPORT")
fact("ble_key_size_min", "Ukuran kunci enkripsi minimum (byte)", 8, "targets/f7/ble_glue/app_conf.h", r"CFG_ENCRYPTION_KEY_SIZE_MIN")
fact("ble_key_size_max", "Ukuran kunci enkripsi maksimum (byte)", 16, "targets/f7/ble_glue/app_conf.h", r"CFG_ENCRYPTION_KEY_SIZE_MAX")
fact("ble_max_links", "Jumlah tautan BLE maksimum", 2, "targets/f7/ble_glue/app_conf.h", r"CFG_BLE_NUM_LINK")
fact("ble_hid_pairing", "Pairing profil HID memakai konfirmasi Yes/No (numeric comparison)", "GapPairingPinCodeVerifyYesNo", HIDP, r"\.pairing_method = ")
fact("ble_serial_pairing", "Pairing profil Serial (aplikasi seluler) menampilkan passkey di Flipper", "GapPairingPinCodeShow", "targets/f7/ble_glue/profiles/serial_profile.c", r"\.pairing_method = ")
fact("ble_hid_bonding", "Profil HID memakai bonding", True, HIDP, r"\.bonding_mode = true")
fact("ble_hid_name_prefix", "Awalan nama iklan profil HID bawaan", "Control", HIDP, r'const char\* clicker_str = "Control"')
fact("ble_badusb_name_prefix", "Awalan nama iklan Bad USB lewat BLE", "BadUSB", "applications/main/bad_usb/helpers/bad_usb_hid.c", r'\.device_name_prefix = "BadUSB"')
fact("hid_kb_max_keys", "Tombol keyboard bersamaan dalam satu report", 6, HIDP, r"#define BLE_PROFILE_HID_KB_MAX_KEYS")
fact("hid_consumer_max_keys", "Tombol consumer control per report", 1, HIDP, r"#define BLE_PROFILE_CONSUMER_MAX_KEYS")
fact("hid_report_ids", "Report ID keyboard=1, mouse=2, consumer=3", {"keyboard": 1, "mouse": 2, "consumer": 3}, HIDP, r"ReportIdKeyboard = 1")
fact("hid_service_uuid", "Layanan HID memakai UUID standar HUMAN_INTERFACE_DEVICE_SERVICE_UUID", "0x1812 (Bluetooth Assigned Numbers)", HIDP, r"\.Service_UUID_16 = HUMAN_INTERFACE_DEVICE_SERVICE_UUID")
fact("badusb_ble_interface", "Bad USB di firmware resmi punya antarmuka BLE", "BadUsbHidInterfaceBle", "applications/main/bad_usb/helpers/bad_usb_hid.h", r"BadUsbHidInterfaceBle")
fact("cc1101_pa_ook", "Komentar tabel daya CC1101 untuk preset OOK: 0xC0 = 12 dBm", 12, "lib/subghz/devices/cc1101_configs.c", r"0xC0, // 12dBm")
fact("cc1101_pa_fsk", "Komentar tabel daya CC1101 untuk preset FSK/MSK/GFSK: 0xC0 = 10 dBm", 10, "lib/subghz/devices/cc1101_configs.c", r"0xC0, // 10dBm")
fact("flash_size", "Flash pada linker script", "1024K", "targets/f7/stm32wb55xx_flash.ld", r"FLASH \(rx\)")
fact("cpu_clock_pll", "Clock CPU aplikasi (Hz)", 64000000, "targets/f7/furi_hal/furi_hal_clock.c", r"#define CPU_CLOCK_PLL_HZ")
fact("expansion_uart_usart", "Pin UART ekspansi: USART TX=13, RX=14", {"tx": 13, "rx": 14}, "documentation/ExpansionModules.md", r"\| USART\s+\| 13")
fact("devboard_default_ssid", "Devboard WiFi bawaan (mode AP) memakai SSID blackmagic", "blackmagic", "documentation/devboard/Wi-Fi connection to the Devboard.md", r"Name: `blackmagic`")
fact("devboard_default_password", "Kata sandi bawaan devboard tertulis publik di dokumentasi resmi", "iamwitcher", "documentation/devboard/Wi-Fi connection to the Devboard.md", r"Password: `iamwitcher`")
fact("devboard_no_5ghz", "Devboard tidak mendukung jaringan 5 GHz", True, "documentation/devboard/Wi-Fi connection to the Devboard.md", r"5 GHz networks aren't supported")

types = {"static": 0, "dynamic": 0, "raw": 0}
for f in sorted((repo / "lib/subghz/protocols").glob("*.c")):
    for m in re.finditer(r"\.type = SubGhzProtocolType(Static|Dynamic|RAW),", f.read_text()):
        types[m.group(1).lower()] += 1
facts.append(
    {
        "id": "subghz_protocol_types",
        "pernyataan": "Hitungan definisi protokol Sub-GHz menurut tipe",
        "nilai": types,
        "berkas": "lib/subghz/protocols/*.c",
        "baris": None,
        "kutipan": ".type = SubGhzProtocolType{Static,Dynamic,RAW}",
    }
)

presets = re.findall(r"subghz_device_cc1101_preset_([a-z0-9_]+)_regs\[\] = \{", (repo / "lib/subghz/devices/cc1101_configs.c").read_text())
facts.append(
    {
        "id": "cc1101_presets",
        "pernyataan": "Set register preset modulasi CC1101 di firmware",
        "nilai": presets,
        "berkas": "lib/subghz/devices/cc1101_configs.c",
        "baris": None,
        "kutipan": "subghz_device_cc1101_preset_*_regs[]",
    }
)

payload = {
    "_meta": {
        "deskripsi": "Fakta teknis yang dibaca dari kode firmware resmi Flipper Zero. Nilai adalah konfigurasi firmware, bukan hasil pengukuran.",
        "repositori": "https://github.com/flipperdevices/flipperzero-firmware",
        "cabang": "dev (klon dangkal)",
        "commit": git("rev-parse", "HEAD"),
        "tanggal_commit": git("log", "-1", "--format=%ad", "--date=short"),
        "dibuat_oleh": "scripts/collect_firmware_facts.py",
    },
    "fakta": facts,
}
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
print(f"{len(facts)} fakta -> {out}")
