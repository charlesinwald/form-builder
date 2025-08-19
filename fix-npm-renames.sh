# fix-npm-renames.sh
#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"
NM="$ROOT/node_modules"

if [[ ! -d "$NM" ]]; then
  echo "No node_modules found at: $NM"
  exit 1
fi

echo "Scanning for half-renamed npm package folders under $NM ..."

# Find temp rename dirs such as ".acorn-XYZ", including nested node_modules (scoped pkgs)
mapfile -t TEMPS < <(find "$NM" -type d -name ".*-*" -prune 2>/dev/null || true)

if [[ ${#TEMPS[@]} -eq 0 ]]; then
  echo "No temp rename dirs found. Nothing to clean."
else
  for t in "${TEMPS[@]}"; do
    base="$(basename "$t")"        # e.g. ".acorn-OGT68U2O"
    pkg_without_random="${base%%-*}" # e.g. ".acorn"
    pkg="${pkg_without_random#.}"  # strip leading dot -> "acorn"
    pkg_dir="$(dirname "$t")/$pkg" # sibling real dir next to the temp dir

    echo "→ Cleaning: $pkg_dir and $t"
    rm -rf "$pkg_dir" "$t"
  done
fi

# Optional: kill stray node processes that might hold locks
if pgrep -f node >/dev/null 2>&1; then
  echo "Detected running node processes; attempting to stop them to avoid locks..."
  pkill -f node || true
fi

echo "Reinstalling dependencies ..."
if [[ -f "$ROOT/package-lock.json" ]]; then
  (cd "$ROOT" && npm ci)
else
  (cd "$ROOT" && npm install)
fi

echo "Done ✅"
