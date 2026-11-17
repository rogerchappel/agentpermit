#!/usr/bin/env bash
set -euo pipefail

while IFS= read -r -d '' script; do
  bash -n "$script"
done < <(find scripts -type f -name '*.sh' -print0)

python3 - <<'PYCODE'
from pathlib import Path
import re
workflow = Path('.github/workflows/ci.yml').read_text()
blocks = re.findall(r'^        run: \|\n((?:          .*\n)+)', workflow, re.MULTILINE)
if not blocks:
    raise SystemExit('No inline run blocks found in CI workflow')
for index, block in enumerate(blocks, start=1):
    lines = [line[10:] for line in block.splitlines()]
    Path(f'/tmp/agentpermit-ci-run-{index}.sh').write_text('\n'.join(lines) + '\n')
PYCODE
for script in /tmp/agentpermit-ci-run-*.sh; do bash -n "$script"; done
