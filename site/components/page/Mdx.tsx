import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentProps } from "react";

/**
 * MDX bodies (case studies, blog posts) in the site's type and spacing.
 * next-mdx-remote 6 blocks JavaScript expressions in MDX by default, so
 * a post is content, never code.
 */
const components = {
  h2: (p: ComponentProps<"h2">) => (
    <h2 className="mt-12 first:mt-0 font-body text-room-section font-medium" {...p} />
  ),
  h3: (p: ComponentProps<"h3">) => (
    <h3 className="mt-8 font-body text-room-card font-medium" {...p} />
  ),
  p: (p: ComponentProps<"p">) => <p className="mt-4 text-room-body text-muted" {...p} />,
  ul: (p: ComponentProps<"ul">) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-room-body text-muted" {...p} />
  ),
  ol: (p: ComponentProps<"ol">) => (
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-room-body text-muted" {...p} />
  ),
  a: (p: ComponentProps<"a">) => (
    <a className="underline decoration-2 underline-offset-4 text-text decoration-amber" {...p} />
  ),
  blockquote: (p: ComponentProps<"blockquote">) => (
    <blockquote className="mt-6 border-l-4 pl-4 border-amber text-room-lede text-text" {...p} />
  ),
};

export function Mdx({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} />;
}
