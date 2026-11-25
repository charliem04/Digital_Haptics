import Link from "next/link";
import type { Post } from "@/lib/content";
import { Panel } from "@/components/ui/Panel";
import { Arrow } from "@/components/ui/Arrow";

/** A blog post card: date and reading time, title, summary. One link, ring follows the cut. */
export function PostCard({
  post,
  headingAs: Heading = "h3",
}: {
  post: Post;
  /** h2 when the card sits directly under the page's h1. */
  headingAs?: "h2" | "h3";
}) {
  return (
    <Panel
      as={Link}
      href={`/blog/${post.slug}/`}
      fill="raised"
      widget
      hover
      className="block h-full no-underline text-text"
      innerClassName="flex h-full flex-col gap-4 p-6"
    >
      <p className="flex flex-wrap gap-x-3 font-body text-room-small text-muted">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingMinutes} min read</span>
        {post.draft && <span className="text-text">· Draft</span>}
      </p>
      <Heading className="font-body text-room-card font-medium">{post.title}</Heading>
      <p className="text-room-small text-muted">{post.description}</p>
      <span className="mt-auto inline-flex items-center gap-2 pt-2 font-body text-room-small font-medium text-text underline underline-offset-[5px] group-hover/panel:decoration-2">
        Read
        <Arrow className="size-3.5 transition-transform duration-[250ms] ease-brand group-hover/panel:translate-x-0.5 group-hover/panel:translate-y-0.5" />
      </span>
    </Panel>
  );
}

/** "2026-11-04" → "Nov 4, 2026", without depending on the build machine's locale. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}
