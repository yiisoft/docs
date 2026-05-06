#!/usr/bin/env bash

set -euo pipefail

if [ "$#" -eq 0 ]; then
    mapfile -d '' files < <(find src -name '*.md' -print0)
else
    files=("$@")
fi

if [ "${#files[@]}" -eq 0 ]; then
    echo "No Markdown files to check."
    exit 0
fi

failed=0

for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        continue
    fi

    output="$(npx markdown-link-check "$file" --quiet --config .markdown-link-check.json 2>&1 || true)"

    if [ -n "$output" ]; then
        printf '%s\n' "$output"
    fi

    if printf '%s\n' "$output" | grep -q 'ERROR:'; then
        failed=1
    fi
done

exit "$failed"
