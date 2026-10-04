#!/usr/bin/env bash
# Equal-wall-budget A/B of the room-entry crawl (round 15b). Time-to-finish is
# not measurable there -- a run in the crawl reports nothing and has to be
# killed, which is how round 15a's withdrawn 41x was produced. So give every
# configuration the SAME wall budget (ISAAC_EXIT_AFTER, which now fires
# because the RECOMP_VA tick is 2^16 instructions) and compare how far the
# guest got: stamped log lines, last stamp, and the dispatch census the stub
# report prints on the way out.
#
#   bash scripts/recomp/profile/ab_crawl.sh [budget_s] [out_dir]
#
# Configurations are "<tag>=<ISAAC_V8_FLAGS>"; an empty flag string is the
# baseline. Runs are sequential on purpose: they compete for the same CPU.
set -u
BUDGET="${1:-300}"
OUT="${2:-output/recomp/profile}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
INST="$REPO/.scratch/game-instance"
mkdir -p "$REPO/$OUT"
INPUT="${ISAAC_INPUT:-420:Enter,470:Enter,520:Enter,580:Enter,640:Enter,700:Enter,760:Enter}"
CONFIGS=("baseline=" "notierup=--no-wasm-tier-up" "nodyntier=--no-wasm-dynamic-tiering")
[ $# -ge 3 ] && CONFIGS=("${@:3}")

printf '%-12s %8s %8s %10s %12s %s\n' config wall_s lines last_s dispatches note
for cfg in "${CONFIGS[@]}"; do
  tag="${cfg%%=*}"; flags="${cfg#*=}"
  log="$REPO/$OUT/ab-$tag.log"
  t0=$(date +%s)
  ( cd "$INST" && ISAAC_LOG_TIME=1 ISAAC_EXIT_AFTER="$BUDGET" ISAAC_INPUT="$INPUT" \
      ISAAC_V8_FLAGS="$flags" \
      node ../../output/recomp/lift/boot/boot_integration.mjs \
           ../../output/recomp/host/isaac.segs.bin main ) > "$log" 2>&1
  rc=$?
  t1=$(date +%s)
  lines=$(grep -ac '^\[ *[0-9.]*\]' "$log")
  last=$(grep -ao '^\[ *[0-9.]*\]' "$log" | tail -1 | tr -dc '0-9.')
  disp=$(grep -a '\[isaac\]\[dispatch\] [0-9]* dispatches' "$log" | head -1 | awk '{print $2}')
  note=""
  grep -aq 'ISAAC_EXIT_AFTER reached' "$log" && note="budget reached"
  grep -aq 'STALL\] no log' "$log" && note="$note +stall dump"
  [ -z "$note" ] && note="exited on its own (rc $rc)"
  printf '%-12s %8s %8s %10s %12s %s\n' "$tag" "$((t1-t0))" "$lines" \
    "$(awk -v v="${last:-0}" 'BEGIN{printf "%.1f", v/1000}')" "${disp:-–}" "$note"
done
