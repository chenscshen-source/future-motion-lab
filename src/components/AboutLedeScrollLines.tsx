"use client";

import { useEffect, useRef, type ReactNode } from "react";

type LedeBlock = {
  className?: string;
  lines: ReactNode[];
};

type AboutLedeScrollLinesProps = {
  blocks: LedeBlock[];
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function AboutLedeScrollLines({ blocks }: AboutLedeScrollLinesProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const lineEls = Array.from(
      root.querySelectorAll<HTMLElement>(".about-lede-scroll-line"),
    );
    if (!lineEls.length) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      lineEls.forEach((line) => {
        line.style.setProperty("--lede-line-progress", "1");
        line.style.setProperty("--lede-line-opacity", "1");
      });
      return;
    }

    const aboutSection = root.closest<HTMLElement>(".manifesto-section");
    const anchor = aboutSection ?? root;

    const LINE_START = 0;
    const LINE_STEP = 0.18;
    const LINE_SPAN = 0.32;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    let rafId = 0;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const vh = window.innerHeight || document.documentElement.clientHeight;

      // Drive progress from the about section's viewport position so the lede
      // begins revealing the moment the section peeks above the bottom edge.
      // progress 0  → section top at viewport bottom (just entering)
      // progress 1  → section top settled near viewport top (~10vh)
      const rect = anchor.getBoundingClientRect();
      const settle = vh * 0.1;
      const span = Math.max(1, vh - settle);
      const progress = clamp01((vh - rect.top) / span);

      for (let i = 0; i < lineEls.length; i++) {
        const start = LINE_START + i * LINE_STEP;
        const linear = clamp01((progress - start) / LINE_SPAN);
        const eased = easeOutCubic(linear);
        lineEls[i].style.setProperty(
          "--lede-line-progress",
          eased.toFixed(4),
        );
        lineEls[i].style.setProperty(
          "--lede-line-opacity",
          eased.toFixed(4),
        );
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [blocks]);

  return (
    <div className="about-lede-scroll" ref={rootRef}>
      {blocks.map((block, blockIndex) => (
        <p
          className={`about-lede-scroll-block ${block.className ?? ""}`.trim()}
          key={blockIndex}
        >
          {block.lines.map((line, lineIndex) => (
            <span className="about-lede-scroll-line" key={lineIndex}>
              {line}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
