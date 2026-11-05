import { jsonLd } from "@/lib/json-ld";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/site.config";
import { pageMetadata, absoluteUrl } from "@/lib/meta";
import { getPost, getPosts, getRelatedPosts } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/layout/Section";
import { SectionHead } from "@/components/page/SectionHead";
import { CtaBand } from "@/components/page/CtaBand";
import { Mdx } from "@/components/page/Mdx";
import { PostCard, formatDate } from "@/components/page/PostCard";

/**
 * ════════════════════════════════════════════════════════════════════
 *  BLOG POST TEMPLATE (PLAN §5): author and date, reading time, the
 *  post, related posts, CTA. Article structured data (PLAN §8).
 *
 *  Published posts only in production; previews also show drafts. With
 *  none, a placeholder `_` renders the 404 page (static export needs at
 *  least one param), as /work/ and /areas/ do.
 * ════════════════════════════════════════════════════════════════════
 */
export const dynamicParams = false;

const NONE = "_";

export function generateStaticParams() {
  const slugs = getPosts().map((p) => ({ slug: p.slug }));
  return slugs.length ? slugs : [{ slug: NONE }];
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPost(params.slug);
  if (!p) return {};
  const meta = pageMetadata(
    { title: p.meta.title, description: p.meta.description, path: `/blog/${p.meta.slug}/` },
    { noindex: p.meta.draft }
  );
  return {
    ...meta,
    openGraph: { ...meta.openGraph, type: "article", publishedTime: p.meta.date },
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const p = getPost(params.slug);
  if (!p) notFound();
  const { meta, body } = p;
  const related = getRelatedPosts(meta.slug);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    author: { "@type": "Person", name: meta.author },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: absoluteUrl(`/blog/${meta.slug}/`),
  };

  return (
    <>
      <PageHero
        path={`/blog/${meta.slug}/`}
        leafLabel={meta.title}
        label="Blog"
        title={meta.title}
        lead={meta.description}
      >
        <p className="flex flex-wrap gap-x-3 font-mono text-label uppercase tracking-label text-steel">
          <span className="text-ink">{meta.author}</span>
          <span aria-hidden>·</span>
          <time dateTime={meta.date}>{formatDate(meta.date)}</time>
          <span aria-hidden>·</span>
          <span>{meta.readingMinutes} min read</span>
        </p>
        {meta.draft && (
          <p className="self-start border border-ink bg-frost px-3 py-2 font-mono text-label uppercase tracking-label">
            Draft: not published. Shown on preview builds only.
          </p>
        )}
      </PageHero>

      <Section spacing="tight" aria-label="Post" className="pb-section-sm lg:pb-section">
        <article className="max-w-[720px]">
          <Mdx source={body} />
        </article>
      </Section>

      {related.length > 0 && (
        <Section tone="frost" className="border-y border-ink" aria-labelledby="related">
          <div className="flex flex-col gap-10">
            <SectionHead id="related" label="Keep reading" title="Related posts" />
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <PostCard post={r} />
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      <CtaBand
        copy={{
          heading: "Want this done for you?",
          body: "Tell us about your business. We handle the website and local search.",
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(articleLd)} />
    </>
  );
}
