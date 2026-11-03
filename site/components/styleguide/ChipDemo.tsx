"use client";

import { useState } from "react";
import { ChipButton } from "@/components/ui/Chip";

/** Styleguide only: interactive filter chips (aria-pressed toggles). */
export function ChipDemo({ options }: { options: string[] }) {
  const [on, setOn] = useState<string[]>([options[0]]);
  const toggle = (o: string) =>
    setOn((cur) => (cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]));

  return (
    <div role="group" aria-label="Filter by trade" className="flex flex-wrap gap-2">
      {options.map((o) => (
        <ChipButton key={o} pressed={on.includes(o)} onClick={() => toggle(o)}>
          {o}
        </ChipButton>
      ))}
    </div>
  );
}
