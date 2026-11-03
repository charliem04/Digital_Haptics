/**
 * "Skip to content": the first thing a keyboard user reaches. Hidden
 * until focused, then an ink tag top-left. Targets <main id="main">.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-touch focus:items-center focus:bg-ink focus:px-4 focus:font-mono focus:text-label focus:uppercase focus:tracking-label focus:text-ice"
    >
      Skip to content
    </a>
  );
}
