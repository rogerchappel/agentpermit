function escapeRegex(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

export function globToRegExp(pattern: string): RegExp {
  const normalized = pattern.replace(/\\/g, '/');
  let body = '';
  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];
    if (char === '*' && next === '*') {
      body += '.*';
      index += 1;
    } else if (char === '*') {
      body += '[^/]*';
    } else {
      body += escapeRegex(char ?? '');
    }
  }
  return new RegExp(`^${body}$`);
}

export function matchesAny(value: string | undefined, patterns: string[] | undefined): boolean {
  if (!patterns || patterns.length === 0) return true;
  if (!value) return false;
  const normalized = value.replace(/\\/g, '/');
  return patterns.some((pattern) => globToRegExp(pattern).test(normalized));
}
