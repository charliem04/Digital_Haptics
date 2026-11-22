import type { Photo } from "@/content/types";

/**
 * About page (PLAN §5 About): who runs Digital Haptics, the
 * construction background, how the agency works, local focus.
 *
 * Written from Charles's answers (docs/QUESTIONS.md §1–5, 2026-11-17),
 * in his voice. Nothing added beyond what he said. Automations work is
 * left out while FEATURE_AUTOMATIONS is off (PLAN §2.1).
 */
export const about = {
  name: "Charles Meyers",
  role: "Founder",
  lead: "I'm Charles Meyers: a web developer from New Iberia, a computer science senior at UL Lafayette, and the son of a tradesman.",
  story: [
    "My father worked as a freelance tradesman, and I worked jobs alongside him. I know how a job is structured, how much a good lead is worth, and how often the phone pulls you off the work in front of you.",
    "Now I build websites for trades businesses, along with larger sites for clients of all kinds. Digital Haptics is how I'm making my name in this field, one solid project at a time.",
  ],
  principles: [
    "No mystery. You'll know what you're paying for, and why, before you pay for it.",
    "Talk to me however suits you: a call, a video meeting or in person. I put my face behind my work.",
    "I handle the technical side: your domain, hosting, maintenance and uptime monitoring.",
    "Every service you pay for stays active and working. That's on me, not you.",
  ],
  local:
    "Based in Lafayette, Acadiana born and raised. I work remotely too, so I take on projects across Louisiana and beyond.",
  /** QUESTIONS.md §4: Charles will supply it. Undefined hides the slot. */
  photo: undefined as Photo | undefined,
};
