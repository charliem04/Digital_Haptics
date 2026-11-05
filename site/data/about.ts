import type { Photo } from "@/content/types";

/**
 * About page (PLAN §5 About): who runs Digital Haptics, the
 * construction background, how the agency works, local focus.
 *
 * Placeholders until Charles answers docs/QUESTIONS.md §1–5. PLAN
 * supplies one fact (worked construction alongside family); nothing
 * else here is invented.
 */
export const about = {
  /** Q3: how Charles is named, and any title. */
  name: "[PLACEHOLDER: name as shown, e.g. Charles Meyers]",
  role: "[PLACEHOLDER: title, e.g. Founder]",
  /** Q1, Q2: one-line introduction under the page title. */
  lead: "[PLACEHOLDER: one-sentence introduction in Charles's words]",
  /** Q1: the story. Paragraphs. */
  story: [
    "[PLACEHOLDER: how working construction alongside family led to building websites for the trades]",
    "[PLACEHOLDER: what that background means for clients]",
  ],
  /** Q2: what working with Digital Haptics is like. Short lines. */
  principles: [
    "[PLACEHOLDER: e.g. how you communicate]",
    "[PLACEHOLDER: e.g. how you handle a project]",
    "[PLACEHOLDER: e.g. what you won't do]",
  ],
  /** Q5: local ties. */
  local: "[PLACEHOLDER: where you're based in Acadiana and your ties to the area]",
  /** Q4: optional. Undefined hides the photo slot. */
  photo: undefined as Photo | undefined,
};
