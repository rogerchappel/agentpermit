#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
smoke_dir="$(mktemp -d "${TMPDIR:-/tmp}/agentpermit-package-smoke.XXXXXX")"
trap 'rm -rf "$smoke_dir"' EXIT

cd "$project_dir"
package_file="$(npm pack --pack-destination "$smoke_dir" --json | node -e '
  let input = "";
  process.stdin.on("data", (chunk) => input += chunk);
  process.stdin.on("end", () => {
    const result = JSON.parse(input);
    if (!result[0]?.filename) process.exit(1);
    process.stdout.write(result[0].filename);
  });
')"

npm install --prefix "$smoke_dir/install" --ignore-scripts "$smoke_dir/$package_file"
"$smoke_dir/install/node_modules/.bin/agentpermit" --help >/dev/null
