// Pure scoring helpers. No imports, so scripts/ can reuse this file directly.

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

// Strict: the whole output equals the expected label, ignoring surrounding
// whitespace and case.
export function isExactMatch(output: string, expected: string): boolean {
  return normalize(output) === normalize(expected);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// True if `label` appears in `text` as a whole word. Letters, digits and "_"
// count as word characters, so "praise" doesn't match inside "praised", and
// "refund" doesn't match inside "refund_request".
function containsWord(text: string, label: string): boolean {
  if (!label) return false;
  return new RegExp(
    `(?<![a-z0-9_])${escapeRegExp(label)}(?![a-z0-9_])`
  ).test(text);
}

// Lenient: the lowercased output contains the expected label as a whole word
// and contains none of the other labels. `labels` is every distinct expected
// value in the test set. Example: "Label: delivery_issue." passes, but
// "delivery_issue or wrong_item" fails.
export function isLenientMatch(
  output: string,
  expected: string,
  labels: string[]
): boolean {
  const text = output.toLowerCase();
  const target = normalize(expected);
  if (!containsWord(text, target)) return false;
  return labels
    .map(normalize)
    .filter((l) => l && l !== target)
    .every((other) => !containsWord(text, other));
}

export function distinctLabels(expectedValues: string[]): string[] {
  return [...new Set(expectedValues.map(normalize).filter(Boolean))];
}
