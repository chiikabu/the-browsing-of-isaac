"""Run the whole host-boundary census in dependency order.

    python scripts/recomp/census/run_all.py

Every number in docs/recomp-host-boundary.md comes from these passes; outputs
land in output/recomp/census/ (gitignored).
"""

import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
STEPS = [
    ("pe_model.py", "PE headers, sections, data directories"),
    ("imports.py", "import directory + IAT call-site counts (capstone cross-check)"),
    ("verify_with_pefile.py", "independent pefile cross-check of the import census"),
    ("exports.py", "export directory + libepoxy GL dispatch census"),
    ("thirdparty.py", "libepoxy stub extraction + vendored-library fingerprints"),
    ("srcpaths.py", "embedded __FILE__ source paths"),
    ("functions.py", "function inventory, call graph, data references"),
    ("attribute.py", ".text byte attribution to components"),
    ("subsystems.py", "imports cross-cut by owning component"),
    ("details.py", "per-symbol detail + dynamic-loading surface"),
    ("dataimage.py", ".data/.rdata sizes, relocations, BSS tail"),
    ("initializers.py", "function-pointer tables in .rdata/.data"),
    ("bootstate.py", "CRT bootstrap and static initialiser tables"),
    ("rollup.py", "final arithmetic"),
]


def main():
    failed = []
    for script, desc in STEPS:
        print("\n" + "=" * 72)
        print("== %-22s %s" % (script, desc))
        print("=" * 72, flush=True)
        t0 = time.time()
        r = subprocess.run([sys.executable, str(HERE / script)])
        print("-- %s exit=%d in %.1fs" % (script, r.returncode, time.time() - t0))
        if r.returncode != 0:
            failed.append(script)
    print("\n" + "=" * 72)
    print("FAILED:" if failed else "all passes completed", ", ".join(failed))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
