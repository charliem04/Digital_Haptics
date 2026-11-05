import { pageMetadata } from "@/lib/meta";
import { isIndexable } from "@/lib/routes";
import { getPosts } from "@/lib/content";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/layout/Section";
import { CtaBand } from "@/components/page/CtaBand";
import { PostCard } from "@/components/page/PostCard";

/**
 * Blog index (PLAN §5): post cards, newest first. Starts with 0 posts;
 * linked from nowhere and noindex until the first one is published.
 */
export const metadata = pageMetadata(
  {
    title: "Blog",
    description:
      "Notes on websites, local search and getting more calls, written for trades businesses in Acadiana.",
    path: "/blog/",
  },
  { noindex: !isIndexable("/blog/") }
);

export default function BlogPage() {
  const posts = getPosts();

  return (
    <>
      <PageHero
        path="/blog/"
        label="Blog"
        title="Notes for trades owners"
        lead="Websites, local search and getting more calls, without the jargon."
      />
      <Section spacing="tight" aria-label="Posts" className="pb-section-sm lg:pb-section">
        {posts.length > 0 ? (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-steel-deep">No posts yet.</p>
        )}
      </Section>
      <CtaBand
        copy={{
          heading: "Rather just talk it through?",
          body: "Tell us about your business and what it needs.",
        }}
      />
    </>
  );
}
