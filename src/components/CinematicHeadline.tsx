"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactElement } from "react";
import { useLanguage } from "@/lib/i18n";

type LineDir = "right" | "up";

type LineSpec = {
  dir: LineDir;
  /** progress (0..1) where this line begins to reveal */
  start: number;
  render: (charSpan: (c: string, i: number) => ReactElement) => ReactElement;
};

const buildChar = (c: string, i: number) => (
  <span
    key={i}
    className="hl-char"
    style={{ "--char-i": i } as CSSProperties}
  >
    {c === " " ? " " : c}
  </span>
);

const buildAccent = (text: string, baseIndex: number) => (
  <span className="accent-mark" key="accent">
    {Array.from(text).map((c, i) =>
      buildChar(c, baseIndex + i),
    )}
  </span>
);

const splitChars = (text: string, offset = 0) =>
  Array.from(text).map((c, i) => buildChar(c, offset + i));

const linesZh: LineSpec[] = [
  {
    dir: "right",
    start: 0.52,
    render: () => <>{splitChars("你的创意，")}</>,
  },
  {
    dir: "right",
    start: 0.62,
    render: () => <>{splitChars("我们的生成式影像引擎——")}</>,
  },
  {
    dir: "up",
    start: 0.74,
    render: () => <>{splitChars("一起交付真正")}</>,
  },
  {
    dir: "up",
    start: 0.84,
    render: () => (
      <>
        {buildAccent("动起来", 0)}
        {splitChars("的画面。", 3)}
      </>
    ),
  },
];

const linesEn: LineSpec[] = [
  {
    dir: "right",
    start: 0.52,
    render: () => <>{buildAccent("Your idea.", 0)}</>,
  },
  {
    dir: "right",
    start: 0.62,
    render: () => <>{buildAccent("Our generative engine.", 0)}</>,
  },
  {
    dir: "up",
    start: 0.74,
    render: () => <>{buildAccent("Frames that", 0)}</>,
  },
  {
    dir: "up",
    start: 0.84,
    render: () => (
      <>
        {buildAccent("actually move", 0)}
        {splitChars(".", 13)}
      </>
    ),
  },
];

export function CinematicHeadline() {
  const ref = useRef<HTMLHeadingElement>(null);
  const lang = useLanguage();
  const lines = lang === "en" ? linesEn : linesZh;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      el.querySelectorAll<HTMLElement>(".hl-line").forEach((l) =>
        l.classList.add("is-revealed"),
      );
      return;
    }

    const lineEls = Array.from(
      el.querySelectorAll<HTMLElement>(".hl-line"),
    );

    let rafId = 0;
    let lastProgress = -1;

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // begin when headline top crosses 90vh (just entering)
      // complete when top reaches 30vh (well in view)
      const startY = vh * 0.9;
      const endY = vh * 0.3;
      const raw = (startY - rect.top) / (startY - endY);
      const progress = Math.max(0, Math.min(1, raw));

      if (Math.abs(progress - lastProgress) < 0.005) return;
      lastProgress = progress;

      lineEls.forEach((line, i) => {
        const spec = lines[i];
        const shouldReveal = progress >= spec.start;
        if (shouldReveal !== line.classList.contains("is-revealed")) {
          line.classList.toggle("is-revealed", shouldReveal);
        }
      });
    };

    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        compute();
      });
    };

    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [lines]);

  return (
    <h2
      ref={ref}
      className="manifesto-headline manifesto-headline--cinematic"
    >
      {lines.map((spec, i) => (
        <span
          key={i}
          className={`hl-line hl-line--${spec.dir}`}
        >
          <span className="hl-line-inner">{spec.render(buildChar)}</span>
        </span>
      ))}
    </h2>
  );
}
