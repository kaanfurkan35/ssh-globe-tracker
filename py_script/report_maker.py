#!/usr/bin/env python3
import argparse, csv, glob, os, sys, re
from datetime import datetime, timedelta, timezone
try:
    from zoneinfo import ZoneInfo  # py>=3.9
except Exception:
    ZoneInfo = None

IST = ZoneInfo("Europe/Istanbul") if ZoneInfo else None

def parse_ts_iso(s: str):
    # e.g. 2025-08-26T14:30:23+0300 (optionally with .%f)
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S.%f%z"):
        try:
            dt = datetime.strptime(s, fmt)
            return dt.astimezone(IST) if IST else dt
        except ValueError:
            continue
    return None

def extract_file_date(filename):
    """Extract date from filename like ssh_report_hpc-desktop_2025-08-26_16-03-33.csv"""
    match = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
    if match:
        try:
            return datetime.strptime(match.group(1), "%Y-%m-%d").date()
        except ValueError:
            pass
    return None

def filter_recent_files(files, days=14):
    """Filter files to only include those from the last N days"""
    cutoff_date = (datetime.now() - timedelta(days=days)).date()
    recent_files = []
    
    for file_path in files:
        filename = os.path.basename(file_path)
        file_date = extract_file_date(filename)
        
        if file_date and file_date >= cutoff_date:
            recent_files.append(file_path)
        elif file_date:
            print(f"Skipping old file: {filename} (date: {file_date})", file=sys.stderr)
    
    return recent_files

def fmt_dt(dt: datetime):
    # dd-mm-yyyy hh:mm:ss (Istanbul)
    return dt.strftime("%d-%m-%Y %H:%M:%S")

def md_table(headers, rows, aligns):
    # Pretty-padded markdown table
    srows = [[("" if c is None else str(c)) for c in r] for r in rows]
    widths = [len(h) for h in headers]
    for r in srows:
        for i, c in enumerate(r):
            widths[i] = max(widths[i], len(c))
    def pad(s, w, align): return s.rjust(w) if align == "right" else s.ljust(w)
    header = "| " + " | ".join(pad(headers[i], widths[i], "left") for i in range(len(headers))) + " |\n"
    sep = []
    for i,w in enumerate(widths):
        w = max(w,3)
        if aligns[i]=="right": sep.append("-"*(w-1)+":")
        elif aligns[i]=="center": sep.append(":"+"-"*(w-2)+":")
        else: sep.append(":"+"-"*(w-1))
    header += "| " + " | ".join(sep) + " |\n"
    body = ""
    for r in srows:
        body += "| " + " | ".join(pad(r[i], widths[i], aligns[i]) for i in range(len(headers))) + " |\n"
    return header + body + "\n"

def main():
    ap = argparse.ArgumentParser(description="Build boss-style SSH session report for last 14 days (IP - User - Method - Start - End - Duration).")
    ap.add_argument("inputs", nargs="+", help="CSV files or globs, e.g. /var/log/ssh_reports/*.csv")
    ap.add_argument("--out", default="/var/log/ssh_reports/ssh_summary_last14d.md", help="Output Markdown path")
    ap.add_argument("--days", type=int, default=14, help="Number of days to include (default: 14)")
    args = ap.parse_args()

    # Expand globs
    all_files = sorted({f for pat in args.inputs for f in glob.glob(pat)})
    if not all_files:
        print("No CSVs found.", file=sys.stderr)
        sys.exit(1)

    # Filter to only recent files (last N days)
    files = filter_recent_files(all_files, args.days)
    if not files:
        print(f"No CSV files found from the last {args.days} days.", file=sys.stderr)
        sys.exit(1)
    
    print(f"Processing {len(files)} files from the last {args.days} days:", file=sys.stderr)
    for f in files:
        print(f"  - {os.path.basename(f)}", file=sys.stderr)

    # Collect unique closed-session rows
    seen = set()
    rows = []
    for f in files:
        try:
            with open(f, newline="") as fh:
                rdr = csv.DictReader(fh)
                for r in rdr:
                    if r.get("event") != "session_closed":
                        continue
                    # stable dedupe key (prefer full message if present)
                    msg = r.get("message","")
                    key = ("msg", msg) if msg else (
                        r.get("timestamp",""), r.get("pid",""), r.get("user",""), r.get("ip",""), r.get("method","")
                    )
                    if key in seen: 
                        continue
                    seen.add(key)

                    end_dt = parse_ts_iso(r.get("timestamp",""))
                    dur_s = r.get("duration_seconds","")
                    if not end_dt or not dur_s or not dur_s.isdigit():
                        continue
                    start_dt = end_dt - timedelta(seconds=int(dur_s))
                    rows.append({
                        "ip": r.get("ip",""),
                        "user": r.get("user",""),
                        "method": r.get("method",""),
                        "start": fmt_dt(start_dt),
                        "end": fmt_dt(end_dt),
                        "duration": int(dur_s),
                    })
        except Exception as e:
            print(f"Skipping {f}: {e}", file=sys.stderr)

    # Sort newest first by end time (string is fine since same format/zone)
    rows.sort(key=lambda x: x["end"], reverse=True)

    # Build pretty table
    table_rows = []
    for r in rows:
        # Render duration as human-friendly
        s = r["duration"]; m, sec = divmod(s,60); h, m = divmod(m,60)
        dstr = (f"{h}h {m}m {sec}s" if h else (f"{m}m {sec}s" if m else f"{sec}s"))
        table_rows.append([r["ip"], r["user"], r["method"], r["start"], r["end"], dstr])

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w") as md:
        md.write("# SSH Sessions (Boss view)\n\n")
        md.write(f"**Timezone:** Europe/Istanbul (UTC+03:00)\n")
        md.write(f"**Report Period:** Last {args.days} days ({len(files)} files processed)\n")
        md.write(f"**Generated:** {datetime.now(IST).strftime('%d-%m-%Y %H:%M:%S') if IST else datetime.now().strftime('%d-%m-%Y %H:%M:%S')}\n\n")
        md.write(md_table(
            headers=["IP", "User", "Method", "Start", "End", "Duration"],
            rows=table_rows,
            aligns=["left","left","left","left","left","right"]
        ))
    print(f"Wrote: {args.out}")
    print(f"Total sessions: {len(table_rows)}")
    print(f"Files processed: {len(files)}")
    print(f"Date range: {args.days} days")

if __name__ == "__main__":
    main()
