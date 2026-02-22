import csv, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
csv_path = ROOT / "contacts.csv"
json_path = ROOT / "contacts.json"

def open_csv_with_fallback(path: pathlib.Path):
    # Try common encodings in order
    encodings = ["utf-8-sig", "utf-8", "cp1252", "iso-8859-1"]
    last_err = None
    for enc in encodings:
        try:
            f = open(path, "r", encoding=enc, newline="")
            # Force a small read to trigger decode errors immediately
            f.read(2048)
            f.seek(0)
            return f, enc
        except UnicodeDecodeError as e:
            last_err = e
    raise last_err

f, used_encoding = open_csv_with_fallback(csv_path)

with f:
    reader = csv.DictReader(f)
    if not reader.fieldnames:
        raise Exception("CSV appears to be empty or unreadable.")
    if "cid" not in reader.fieldnames:
        raise Exception(f"CSV must include a 'cid' column. Found: {reader.fieldnames}")

    out = {}
    for row in reader:
        cid = (row.get("cid") or "").strip()
        if not cid:
            continue

        record = {}
        for k, v in row.items():
            if k == "cid":
                continue
            if v is None:
                continue

            v = v.strip()
            if v != "":
                # Normalize escaped sequences if they somehow exist
                v = v.replace("\\n", "\n")
                v = v.replace('\\"', '"')

                record[k] = v

        out[cid] = record

json_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"contacts.json generated from {csv_path.name} using encoding: {used_encoding}")
