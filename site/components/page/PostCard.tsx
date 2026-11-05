import Link from "next/link";
import type { Post } from "@/lib/content";
import { CutFrame } from "@/components/ui/CutFrame";
import { Arrow } from "@/components/ui/Arrow";

/** A blog post card: date and reading time, title, summary. One link, ring follows the cut. */
export function PostCard({ post }: { post: Post }) {
  return (
    <CutFrame
      as={Link}
      href={`/blog/${post.slug}/`}
      size="md"
      fill="white"
      ring
      className="block h-full text-ink no-underline"
      innerClassName="flex h-full flex-col gap-4 p-6"
    >
      <p className="flex flex-wrap gap-x-3 font-mono text-label-sm uppercase tracking-label text-steel">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingMinutes} min read</span>
        {post.draft && <span className="text-ink">· Draft</span>}
      </p>
      <h3 className="font-display text-subheading font-semibold">{post.title}</h3>
      <p className="text-body-sm text-steel-deep">{post.description}</p>
      <span className="mt-auto inline-flex items-center gap-2 pt-2 font-mono text-label uppercase tracking-label">
        Read
        <Arrow className="size-3.5 transition-transform duration-[250ms] ease-brand group-hover/cut:translate-x-0.5 group-hover/cut:translate-y-0.5" />
      </span>
    </CutFrame>
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
