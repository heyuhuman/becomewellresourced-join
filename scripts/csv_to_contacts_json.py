import csv, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
csv_path = ROOT / "contacts.csv"
json_path = ROOT / "contacts.json"

with open(csv_path, "r", encoding="utf-8-sig", newline="") as f:
    reader = csv.DictReader(f)
    if "cid" not in reader.fieldnames:
        raise Exception("CSV must include a 'cid' column.")

    out = {}
    for row in reader:
        cid = row["cid"].strip()
        if not cid:
            continue

        record = {}
        for k, v in row.items():
            if k == "cid":
                continue
            if v and v.strip():
                record[k] = v.strip()

        out[cid] = record

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2)

print("contacts.json generated.")
