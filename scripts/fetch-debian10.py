#!/usr/bin/env python3
"""Find and download debian10.zip base FS for Boxedwine depends.txt."""
import re
import sys
import urllib.request
from pathlib import Path

root = Path(__file__).resolve().parents[1]
scratch = root / ".scratch"
emu = root / "web" / "emu"
out = emu / "debian10.zip"
scratch.mkdir(parents=True, exist_ok=True)
emu.mkdir(parents=True, exist_ok=True)

candidates = [
    "https://master.dl.sourceforge.net/project/boxedwine/FileSystems/Full/v5/Debian10.zip?viasf=1",
    "https://master.dl.sourceforge.net/project/boxedwine/FileSystems/Base/Debian10.zip?viasf=1",
    "https://master.dl.sourceforge.net/project/boxedwine/FileSystems/Debian10.zip?viasf=1",
    "https://master.dl.sourceforge.net/project/boxedwine/FileSystems/Full/Debian10.zip?viasf=1",
    "https://master.dl.sourceforge.net/project/boxedwine/FileSystems/Full/v5/debian10.zip?viasf=1",
    "https://master.dl.sourceforge.net/project/boxedwine/FileSystems/TinyCore/Debian10.zip?viasf=1",
]

# scrape listing pages
listing_urls = [
    "https://sourceforge.net/projects/boxedwine/files/FileSystems/",
    "https://sourceforge.net/projects/boxedwine/files/FileSystems/Full/",
    "https://sourceforge.net/projects/boxedwine/files/FileSystems/Full/v5/",
    "https://sourceforge.net/projects/boxedwine/files/FileSystems/Base/",
]


def fetch(url, dest=None, timeout=120):
    req = urllib.request.Request(url, headers={"User-Agent": "Wget/1.21"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        data = r.read()
    if dest:
        dest.write_bytes(data)
    return data


def is_zip(data: bytes) -> bool:
    return len(data) > 1000 and data[:2] == b"PK"


# scrape
found = []
for lu in listing_urls:
    try:
        html = fetch(lu).decode("utf-8", "replace")
        print("listed", lu, "bytes", len(html))
        for m in re.finditer(r'href="([^"]+)"', html):
            h = m.group(1)
            if re.search(r"debian10|Debian10", h, re.I):
                found.append(h)
                print("  found link", h)
    except Exception as e:
        print("list fail", lu, e)

# normalize SF links
for h in list(found):
    if h.startswith("/"):
        candidates.append("https://sourceforge.net" + h)
    elif h.startswith("http"):
        candidates.append(h)

# also try Files/ path patterns from page
for h in found:
    name = h.rstrip("/").split("/")[-1]
    if name.endswith(".zip"):
        candidates.append(
            f"https://master.dl.sourceforge.net/project/boxedwine/FileSystems/Full/v5/{name}?viasf=1"
        )

seen = set()
for url in candidates:
    if url in seen:
        continue
    seen.add(url)
    print("TRY", url)
    try:
        data = fetch(url, timeout=180)
        print("  size", len(data), "magic", data[:4])
        if is_zip(data) and len(data) > 5_000_000:
            out.write_bytes(data)
            print("SUCCESS wrote", out, len(data))
            sys.exit(0)
        # save small for debug
        (scratch / "debian10-try.bin").write_bytes(data[:2000])
    except Exception as e:
        print("  fail", e)

print("FAILED to get debian10.zip")
sys.exit(1)
