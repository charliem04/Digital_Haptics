"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { dur, ease, stagger, travel, viewport } from "@/lib/motion";
import { useStillness } from "@/lib/useScrollMotion";
import type { LeadFlowStep } from "@/content/types";

/**
 * The lead-flow rows, sequencing in once as the panel enters the
 * viewport (PLAN §4.6). Still under reduced motion. Only ever rendered
 * by <LeadFlowPanel>, which owns the flag check.
 */
export function LeadFlowRows({ steps }: { steps: LeadFlowStep[] }) {
  const still = useStillness();
  const last = steps.length - 1;

  return (
    <motion.ol
      className="flex flex-col gap-2.5"
      initial={still ? false : "hidden"}
      whileInView="shown"
      viewport={viewport.standard}
    >
      {steps.map((s, i) => (
        <motion.li
          key={s.key}
          variants={{
            hidden: { opacity: 0, y: travel.sm },
            shown: {
              opacity: 1,
              y: 0,
              transition: { duration: dur.base, ease: ease.out, delay: i * stagger.sequence },
            },
          }}
          className={cn(
            "flex justify-between",
            i === last && "-mx-1.5 bg-signal px-1.5 py-1 text-ink"
          )}
        >
          <span className={i === last ? undefined : "text-steel"}>{s.key}</span>
          <span className={i === last ? "font-medium" : undefined}>{s.value}</span>
        </motion.li>
      ))}
    </motion.ol>
  );
}
