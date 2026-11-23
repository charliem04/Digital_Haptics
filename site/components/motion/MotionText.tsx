import type { CSSProperties, ReactNode } from "react";
import { motionConfig } from "@/motion.config";

/**
 * Heading text, split only when the chosen style needs it. `sweep` works
 * on the whole element, so it adds no markup. The text is always in the
 * HTML and visible until MotionRuntime arms it.
 */
export function MotionText({ children }: { children: ReactNode }) {
  const style = motionConfig.text;
  if (style === "sweep" || typeof children !== "string") return <>{children}</>;

  const words = children.split(" ");

  if (style === "underline") {
    if (words.length < 2) return <span className="motion-key">{children}</span>;
    return (
      <>
        {words.slice(0, -2).join(" ")}{" "}
        <span className="motion-key">{words.slice(-2).join(" ")}</span>
      </>
    );
  }

  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="motion-word" style={{ "--i": i } as CSSProperties}>
            <span className="motion-word-inner">{word}</span>
          </span>{" "}
        </span>
      ))}
    </>
  );
}
