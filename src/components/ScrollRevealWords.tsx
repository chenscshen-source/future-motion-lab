"use client";

import { useEffect, useRef } from "react";
import type { HTMLAttributes } from "react";

type Props = {
  /** Space-separated words; each word reveals on its own slice of the scroll. */
  text: string;
  /** className applied to the root <p>. */
  className?: string;
  /**
   * Start/end of the active scroll window expressed as fractions of viewport
   * height, measured against the element's center crossing the viewport.
   *   start = element-center sits at (1 + start)·vh from the top of the viewport
   *   end   = element-center sits at (1 - end)·vh from the top of the viewport
   * Default: starts when the element is just below the viewport, ends when it
   * has scrolled past the viewport's vertical mid-point.
   */
  windowStart?: number;
  windowEnd?: number;
  /**
   * Per-word stagger overlap (0 = sequential, 1 = simultaneous).
   * Default 0.45 — each word starts before the previous one has finished.
   */
  overlap?: number;
} & Omit<HTMLAttributes<HTMLParagraphElement>, "children">;

/**
 * Scroll-driven word reveal.
 *
 * Each word reveals progressively — its opacity / blur / Y offset is mapped
 * to a slice of the section's scroll progress, so the user can scrub the
 * effect by scrolling up and down. Stops one rAF tick after settling to
 * keep idle CPU at zero.
 */
export function ScrollRevealWords({
  text,
  className,
  windowStart = 0.35,
  windowEnd = 0.25,
  overlap = 0.45,
  ...rest
}: Props) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const words = text.split(" ");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const wordEls = Array.from(
      node.querySelectorAll<HTMLElement>(".srw-word")
    );
    if (wordEls.length === 0) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      wordEls.forEach((el) => {
        el.style.setProperty("--p", "1");
      });
      return;
    }

    const N = wordEls.length;
    // Each word occupies its own slice of progress. With overlap=0.45 and
    // N=3 the slices are e.g. [0–0.55], [0.225–0.775], [0.45–1.0].
    const sliceLen = N === 1 ? 1 : 1 / (1 + (N - 1) * (1 - overlap));
    const sliceStep = N === 1 ? 0 : (1 - sliceLen) / (N - 1);

    let rafId = 0;
    let lastProgress = -1;

    const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const tick = () => {
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Center of the element relative to the viewport top.
      const center = rect.top + rect.height / 2;
      // Map: center == (1+windowStart)·vh → progress 0
      //      center == (windowEnd)·vh        → progress 1
      const startY = (1 + windowStart) * vh;
      const endY = windowEnd * vh;
      const range = startY - endY;
      const raw = range === 0 ? 0 : (startY - center) / range;
      const progress = clamp01(raw);

      if (Math.abs(progress - lastProgress) > 0.001) {
        lastProgress = progress;
        for (let i = 0; i < N; i++) {
          const sliceStart = i * sliceStep;
          const sliceEnd = sliceStart + sliceLen;
          const local =
            sliceEnd === sliceStart
              ? progress >= sliceStart
                ? 1
                : 0
              : (progress - sliceStart) / (sliceEnd - sliceStart);
          wordEls[i].style.setProperty("--p", clamp01(local).toFixed(4));
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [text, windowStart, windowEnd, overlap]);

  return (
    <p ref={ref} className={className} {...rest}>
      {words.map((word, i) => (
        <span className="srw-word" key={`${word}-${i}`} style={{ "--p": 0 } as React.CSSProperties}>
          {word}
        </span>
      ))}
    </p>
  );
}
