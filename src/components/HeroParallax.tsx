"use client";

import { useEffect } from "react";

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

export function HeroParallax() {
  useEffect(() => {
    const home = document.querySelector<HTMLElement>(".home-deck");
    if (!home) return;

    let rafId = 0;
    let last = -1;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const vh = window.innerHeight || 1;
      const progress = clamp(window.scrollY / vh);
      if (progress === last) return;
      last = progress;
      home.style.setProperty("--hero-exit-progress", progress.toFixed(4));
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return null;
}
