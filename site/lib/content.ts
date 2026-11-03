/**
 * ════════════════════════════════════════════════════════════════════
 *  CONTENT LOADER — the only door to content.
 *
 *  Pages and components import content through here, never from
 *  data/* or content/* directly, so the storage can change (TS module,
 *  MDX, a CMS) without touching a component. Every getter returns the
 *  shapes in content/types.ts.
 *
 *  Layout per PLAN §6:
 *    data/*.ts          typed data: services, cities, FAQ, form options
 *    content/work/*.mdx case studies
 *    content/blog/*.mdx blog posts
 *
 *  Getters are added with the pages that read them (Phase 3 onward).
 *  Flag filtering happens here, so a flagged item (the Automations
 *  service, for example) never reaches a page with its flag off.
 * ════════════════════════════════════════════════════════════════════
 */
export {};
