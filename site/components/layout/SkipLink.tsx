/**
 * "Skip to content": the first thing a keyboard user reaches. Hidden
 * until focused, then an ink tag top-left. Targets <main id="main">.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-touch focus:items-center focus:px-4 focus:rounded-control focus:bg-amber focus:font-body focus:text-room-small focus:text-on-amber"
    >
      Skip to content
    </a>
  );
}
