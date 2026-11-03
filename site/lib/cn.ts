/** Join class names, skipping falsy entries. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** 1 → "01". Section and case numbering (PLAN §4.4). */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
